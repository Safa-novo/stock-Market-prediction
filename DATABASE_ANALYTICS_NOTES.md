# Database and Analytics Features

This project now includes a backend database and technical-analysis workflow.

## Backend database

- The Express server writes local data to `server/data/market-database.json`.
- The database stores generated stock price history, prediction records and watchlist entries.
- Firebase is still supported when configured, but the project now works without Firebase credentials.

## Analysis methods

- Linear interpolation fills missing price days before analysis.
- Least-squares regression calculates slope, intercept, R-squared and next-day projection.
- 5-day and 10-day moving averages are calculated for crossover signals.
- The predictor combines momentum, volatility, regression and moving-average spread into a trend signal.

## API routes

- `GET /api/health`
- `GET /api/predictions`
- `GET /api/predictions/:symbol`
- `GET /api/stocks/:symbol/history`
- `GET /api/watchlist`
- `POST /api/watchlist`
- `DELETE /api/watchlist/:id`

## Run

```bash
npm install
npm run dev
```

