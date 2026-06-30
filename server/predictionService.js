import {
  getOrCreatePriceSeries,
  listSavedPredictions,
  savePrediction,
} from "./localDatabase.js";

import { getStockPrice } from "./stockService.js";

function round(value, digits = 2) {
  return Number(value.toFixed(digits));
}

function seededNoise(symbol, day) {
  const seed = [...symbol].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return (
    Math.sin(seed * 0.41 + day * 0.73) + Math.cos(seed * 0.13 + day * 0.37)
  );
}

function generatedPrice(start, symbol, day) {
  const drift = day * (0.13 + (symbol.length % 4) * 0.035);
  const cyclicalMove = seededNoise(symbol, day) * 2.9;
  return Math.max(5, start + drift + cyclicalMove);
}

export async function buildObservedPriceSeries(symbolInput) {
  const symbol = symbolInput.toUpperCase();
  const startPrice = await getStockPrice(symbol);
  const points = [];

  const seed = [...symbol].reduce((sum, char) => sum + char.charCodeAt(0), 0);

  for (let day = 1; day <= 60; day += 1) {
    const intentionallyMissing =
      day > 5 &&
      day < 58 &&
      ((day + seed) % 13 === 0 || (day + seed) % 19 === 0);

    if (!intentionallyMissing) {
      points.push({
        day,
        price: round(generatedPrice(startPrice, symbol, day)),
        observed: true,
      });
    }
  }

  return points;
}

function interpolateSeries(observedSeries) {
  const byDay = new Map(observedSeries.map((point) => [point.day, point]));
  const maxDay = Math.max(...observedSeries.map((point) => point.day));
  const interpolated = [];
  let filledCount = 0;

  for (let day = 1; day <= maxDay; day += 1) {
    const observed = byDay.get(day);

    if (observed) {
      interpolated.push({
        ...observed,
        observedPrice: observed.price,
        interpolated: false,
      });
      continue;
    }

    const previous = [...observedSeries]
      .reverse()
      .find((point) => point.day < day);
    const next = observedSeries.find((point) => point.day > day);
    let price = previous?.price || next?.price || 0;

    if (previous && next) {
      const ratio = (day - previous.day) / (next.day - previous.day);
      price = previous.price + (next.price - previous.price) * ratio;
    }

    filledCount += 1;
    interpolated.push({
      day,
      price: round(price),
      observedPrice: null,
      interpolated: true,
    });
  }

  return {
    series: interpolated,
    filledCount,
  };
}

function movingAverage(series, windowSize, keyName) {
  return series.map((point, index) => {
    const start = Math.max(0, index - windowSize + 1);
    const window = series.slice(start, index + 1);
    const average =
      window.reduce((sum, item) => sum + item.price, 0) / window.length;

    return {
      ...point,
      [keyName]: round(average),
    };
  });
}

function addMovingAverages(series) {
  const withShortAverage = movingAverage(series, 5, "movingAverage5");
  return movingAverage(withShortAverage, 10, "movingAverage10");
}

function regressionAnalysis(series) {
  const n = series.length;
  const sumX = series.reduce((sum, point) => sum + point.day, 0);
  const sumY = series.reduce((sum, point) => sum + point.price, 0);
  const sumXY = series.reduce((sum, point) => sum + point.day * point.price, 0);
  const sumXX = series.reduce((sum, point) => sum + point.day * point.day, 0);
  const denominator = n * sumXX - sumX * sumX;
  const slope = denominator === 0 ? 0 : (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;
  const meanY = sumY / n;
  const ssTotal = series.reduce(
    (sum, point) => sum + (point.price - meanY) ** 2,
    0,
  );
  const ssResidual = series.reduce((sum, point) => {
    const predicted = intercept + slope * point.day;
    return sum + (point.price - predicted) ** 2;
  }, 0);
  const rSquared = ssTotal === 0 ? 1 : 1 - ssResidual / ssTotal;

  return {
    slope,
    intercept,
    rSquared: Math.max(0, Math.min(1, rSquared)),
    nextDayProjection: intercept + slope * (series.at(-1).day + 1),
  };
}

function addRegressionLine(series, regression) {
  return series.map((point) => ({
    ...point,
    regressionPrice: round(regression.intercept + regression.slope * point.day),
  }));
}

function calculateVolatility(series) {
  return (
    series.reduce((sum, point, index) => {
      if (index === 0) return sum;
      return sum + Math.abs(point.price - series[index - 1].price);
    }, 0) / Math.max(1, series.length - 1)
  );
}

export async function predictTrend(symbolInput) {
  const symbol = symbolInput.toUpperCase();
  const observedSeries = await getOrCreatePriceSeries(
    symbol,
    buildObservedPriceSeries,
  );
  const interpolation = interpolateSeries(observedSeries);
  const withMovingAverage = addMovingAverages(interpolation.series);
  const regression = regressionAnalysis(withMovingAverage);
  const series = addRegressionLine(withMovingAverage, regression);

  const recent = series.slice(-10);
  const first = recent[0].price;
  const last = recent.at(-1).price;
  const momentum = ((last - first) / first) * 100; //momentum
  const volatility = calculateVolatility(recent); //valusity
  const latestShortAverage = series.at(-1).movingAverage5;
  const latestLongAverage = series.at(-1).movingAverage10;
  const averageSpread =
    ((latestShortAverage - latestLongAverage) / latestLongAverage) * 100;
  const regressionPercent = (regression.slope / last) * 100;
  const score =
    momentum * 0.45 +
    averageSpread * 0.35 +
    regressionPercent * 20 -
    volatility * 0.08;
  const trend = score > 0.8 ? "Bullish" : score < -0.8 ? "Bearish" : "Sideways";
  const confidence = Math.min(
    96,
    Math.max(
      55,
      Math.round(62 + Math.abs(score) * 11 + regression.rSquared * 12),
    ),
  );
  const projectedPrice = round(regression.nextDayProjection);

  const prediction = {
    symbol,
    trend,
    confidence,
    currentPrice: round(last),
    projectedPrice,
    momentum: round(momentum),
    volatility: round(volatility),
    series,
    interpolation: {
      method: "Linear interpolation",
      observedPoints: observedSeries.length,
      missingPointsFilled: interpolation.filledCount,
    },
    regression: {
      method: "Least-squares linear regression",
      slope: round(regression.slope, 4),
      intercept: round(regression.intercept, 4),
      rSquared: round(regression.rSquared, 3),
      nextDayProjection: projectedPrice,
      direction:
        regression.slope > 0
          ? "Upward"
          : regression.slope < 0
            ? "Downward"
            : "Flat",
    },
    movingAverage: {
      shortWindow: 5,
      longWindow: 10,
      shortLatest: round(latestShortAverage),
      longLatest: round(latestLongAverage),
      signal:
        latestShortAverage > latestLongAverage
          ? "Positive crossover"
          : "Negative crossover",
    },
    database: {
      engine: "Local JSON database",
      storedObservedRecords: observedSeries.length,
      analyzedRecords: series.length,
    },
    generatedAt: new Date().toISOString(),
  };

  await savePrediction(prediction);
  return prediction;
}

export async function getHistoricalSeries(symbolInput) {
  const symbol = symbolInput.toUpperCase();
  const observedSeries = await getOrCreatePriceSeries(
    symbol,
    buildObservedPriceSeries,
  );
  const interpolation = interpolateSeries(observedSeries);
  const withMovingAverage = addMovingAverages(interpolation.series);
  const regression = regressionAnalysis(withMovingAverage);

  return addRegressionLine(withMovingAverage, regression);
}

export async function getPredictionHistory(limit) {
  return listSavedPredictions(limit);
}
