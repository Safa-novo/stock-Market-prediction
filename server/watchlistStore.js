import { randomUUID } from "node:crypto";
import { db } from "./firebaseAdmin.js";

function normalizeSymbol(symbol) {
  return symbol.trim().toUpperCase();
}

export async function listWatchlist() {
  const snapshot = await db.ref("watchlist").once("value");

  const data = snapshot.val() || {};

  return Object.entries(data).map(([id, value]) => ({
    id,
    ...value,
  }));
}

export async function addWatchlistItem(payload) {
  const item = {
    id: randomUUID(),
    symbol: normalizeSymbol(payload.symbol),
    companyName: payload.companyName || "",
    note: payload.note || "",
    createdAt: new Date().toISOString(),
  };

  await db.ref(`watchlist/${item.id}`).set(item);

  return item;
}

export async function removeWatchlistItem(id) {
  await db.ref(`watchlist/${id}`).remove();
}
