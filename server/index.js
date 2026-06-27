import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import { firebaseEnabled } from "./firebaseAdmin.js";
import {
  getHistoricalSeries,
  getPredictionHistory,
  predictTrend,
} from "./predictionService.js";
import {
  addWatchlistItem,
  listWatchlist,
  removeWatchlistItem,
} from "./watchlistStore.js";

const app = express();
const port = Number(process.env.PORT || 5000);

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

app.get("/api/health", (_request, response) => {
  response.json({
    status: "ok",
    database: "local-json",
    firebase: firebaseEnabled ? "connected" : "not-configured",
  });
});

app.get("/api/predictions", async (request, response, next) => {
  try {
    const limit = Number(request.query.limit || 20);
    response.json(await getPredictionHistory(limit));
  } catch (error) {
    next(error);
  }
});

app.get("/api/predictions/:symbol", async (request, response, next) => {
  try {
    const symbol = request.params.symbol?.trim();

    if (!symbol) {
      return response.status(400).json({ message: "Symbol is required." });
    }

    return response.json(await predictTrend(symbol));
  } catch (error) {
    return next(error);
  }
});

app.get("/api/stocks/:symbol/history", async (request, response, next) => {
  try {
    const symbol = request.params.symbol?.trim();

    if (!symbol) {
      return response.status(400).json({ message: "Symbol is required." });
    }

    return response.json(await getHistoricalSeries(symbol));
  } catch (error) {
    return next(error);
  }
});

app.get("/api/watchlist", async (_request, response, next) => {
  try {
    response.json(await listWatchlist());
  } catch (error) {
    next(error);
  }
});

app.post("/api/watchlist", async (request, response, next) => {
  try {
    const symbol = request.body.symbol?.trim();

    if (!symbol) {
      return response.status(400).json({ message: "Symbol is required." });
    }

    const item = await addWatchlistItem(request.body);
    return response.status(201).json(item);
  } catch (error) {
    next(error);
  }
});

app.delete("/api/watchlist/:id", async (request, response, next) => {
  try {
    await removeWatchlistItem(request.params.id);
    response.status(204).send();
  } catch (error) {
    next(error);
  }
});

app.use((error, _request, response, _next) => {
  console.error(error);

  response.status(500).json({
    message: error.message,
  });
});
console.log("API KEY =", process.env.ALPHA_VANTAGE_KEY);
app.listen(port, () => {
  console.log(`API server running on http://localhost:${port}`);
});
