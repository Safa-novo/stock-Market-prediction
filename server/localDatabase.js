import { db } from "./firebaseAdmin.js";

function normalizeSymbol(symbol) {
  return symbol.trim().toUpperCase();
}

// ===================== PRICES =====================

export async function getOrCreatePriceSeries(symbolInput, createSeries) {
  const symbol = normalizeSymbol(symbolInput);

  const snapshot = await db.ref(`prices/${symbol}`).once("value");

  if (!snapshot.exists()) {
    const series = await createSeries(symbol);

    await db.ref(`prices/${symbol}`).set(series);

    return series;
  }

  return snapshot.val();
}

// ===================== PREDICTIONS =====================

export async function savePrediction(prediction) {
  const ref = db.ref("predictions").push();

  await ref.set({
    symbol: prediction.symbol,
    trend: prediction.trend,
    confidence: prediction.confidence,
    currentPrice: prediction.currentPrice,
    projectedPrice: prediction.projectedPrice,
    generatedAt: prediction.generatedAt,
  });
}

export async function listSavedPredictions(limit = 20) {
  const snapshot = await db.ref("predictions").limitToLast(limit).once("value");

  const data = snapshot.val() || {};

  return Object.entries(data)
    .map(([id, value]) => ({
      id,
      ...value,
    }))
    .reverse();
}

// ===================== WATCHLIST =====================

export async function listLocalWatchlist() {
  const snapshot = await db.ref("watchlist").once("value");

  const data = snapshot.val() || {};

  return Object.entries(data).map(([id, value]) => ({
    id,
    ...value,
  }));
}

export async function addLocalWatchlistItem(payload) {
  const item = {
    symbol: normalizeSymbol(payload.symbol),
    companyName: payload.companyName || "",
    note: payload.note || "",
    createdAt: new Date().toISOString(),
  };

  const ref = db.ref("watchlist").push();

  await ref.set(item);

  return {
    id: ref.key,
    ...item,
  };
}

export async function removeLocalWatchlistItem(id) {
  await db.ref(`watchlist/${id}`).remove();
}
