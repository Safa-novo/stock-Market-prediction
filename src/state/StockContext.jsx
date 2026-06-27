import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  createWatchlistItem,
  deleteWatchlistItem,
  fetchPrediction,
  fetchWatchlist
} from '../api/stocks.js';

const StockContext = createContext(null);

export function StockProvider({ children }) {
  const [watchlist, setWatchlist] = useState([]);
  const [predictions, setPredictions] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function loadWatchlist() {
    setError('');
    const data = await fetchWatchlist();
    setWatchlist(data);
  }

  async function predict(symbol) {
    setLoading(true);
    setError('');

    try {
      const prediction = await fetchPrediction(symbol);
      setPredictions((current) => ({ ...current, [prediction.symbol]: prediction }));
      return prediction;
    } catch (caughtError) {
      setError(caughtError.message);
      throw caughtError;
    } finally {
      setLoading(false);
    }
  }

  async function addToWatchlist(payload) {
    setError('');
    const item = await createWatchlistItem(payload);
    setWatchlist((current) => [item, ...current]);
    return item;
  }

  async function removeFromWatchlist(id) {
    setError('');
    await deleteWatchlistItem(id);
    setWatchlist((current) => current.filter((item) => item.id !== id));
  }

  useEffect(() => {
    loadWatchlist().catch((caughtError) => setError(caughtError.message));
  }, []);

  const value = useMemo(
    () => ({
      watchlist,
      predictions,
      latestPrediction: Object.values(predictions).at(-1),
      loading,
      error,
      predict,
      addToWatchlist,
      removeFromWatchlist,
      reloadWatchlist: loadWatchlist
    }),
    [watchlist, predictions, loading, error]
  );

  return <StockContext.Provider value={value}>{children}</StockContext.Provider>;
}

export function useStocks() {
  const context = useContext(StockContext);

  if (!context) {
    throw new Error('useStocks must be used inside StockProvider.');
  }

  return context;
}
