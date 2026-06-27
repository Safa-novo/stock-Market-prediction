export async function fetchPrediction(symbol) {
  const response = await fetch(
    `/api/predictions/${encodeURIComponent(symbol)}`,
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to generate prediction.");
  }

  return data;
}

export async function fetchWatchlist() {
  const response = await fetch("/api/watchlist");

  if (!response.ok) {
    throw new Error("Unable to load watchlist.");
  }

  return response.json();
}

export async function createWatchlistItem(payload) {
  const response = await fetch("/api/watchlist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Unable to save watchlist item.");
  }

  return response.json();
}

export async function deleteWatchlistItem(id) {
  const response = await fetch(`/api/watchlist/${id}`, { method: "DELETE" });

  if (!response.ok) {
    throw new Error("Unable to delete watchlist item.");
  }
}
