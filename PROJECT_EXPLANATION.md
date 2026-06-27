# Stock Market Trend Predictor - Project Explanation

## 1. Project Overview

This project is a full-stack stock market trend predictor application. It lets users enter a stock ticker symbol, generate a trend prediction, view a price chart, and save selected stocks into a watchlist.

The project is built as a monolithic JavaScript application, meaning the frontend and backend live inside one npm project folder. There is only one `package.json`, and the whole app can be started with one command:

```bash
npm run dev
```

That command starts:

- The React frontend using Vite
- The Express backend API using Node.js

## 2. Technologies Used

The frontend uses:

- ReactJS for building the user interface
- Mantine UI for ready-made UI components
- React Router for navigation between pages
- Context API for global state management
- Recharts for displaying the stock price chart
- Firebase Web SDK for frontend Firebase configuration

The backend uses:

- Node.js as the JavaScript runtime
- Express.js for creating API routes
- Firebase Admin SDK for connecting the backend to Firestore
- Firestore as the database for saved watchlist items

## 3. Project Structure

The project has one npm package at the root level.

```text
Stock Market Trend Predictor/
├── package.json
├── .env.example
├── index.html
├── vite.config.js
├── server/
│   ├── index.js
│   ├── firebaseAdmin.js
│   ├── predictionService.js
│   └── watchlistStore.js
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── firebase.js
    ├── api/
    │   └── stocks.js
    ├── state/
    │   └── StockContext.jsx
    ├── components/
    │   ├── PredictionCard.jsx
    │   └── PriceChart.jsx
    └── pages/
        ├── Dashboard.jsx
        ├── Predictor.jsx
        └── Watchlist.jsx
```

## 4. How The App Runs Locally

First, dependencies are installed:

```bash
npm install
```

Then the app is started:

```bash
npm run dev
```

The frontend runs at:

```text
http://localhost:5173
```

The backend API runs at:

```text
http://localhost:5000
```

Vite is configured to proxy `/api` requests from the frontend to the backend. This means the React app can call `/api/predictions/AAPL`, and Vite forwards that request to the Express server.

## 5. Frontend Flow

The frontend has three main pages:

### Dashboard

The dashboard shows a summary of the app, including:

- The latest prediction
- The number of watchlist items
- A reminder that the backend uses Express and Firebase

If a prediction has been generated, the dashboard also shows the prediction card and price chart.

### Predictor

The predictor page allows the user to enter a ticker symbol, such as:

```text
AAPL
MSFT
TSLA
NVDA
```

When the user clicks the predict button, the frontend calls the backend API:

```text
GET /api/predictions/:symbol
```

The backend returns a generated prediction, and the frontend displays:

- Stock symbol
- Trend result
- Current price
- Projected price
- Momentum
- Volatility
- Confidence score
- Price chart

The user can also save the prediction to the watchlist.

### Watchlist

The watchlist page lets the user:

- Add a stock symbol
- Add a company name
- Add a note
- Delete saved items

These watchlist items are stored in Firebase Firestore when Firebase credentials are configured. If Firebase is not configured, the backend uses a temporary in-memory fallback for local development.

## 6. State Management

The app uses React Context API in `src/state/StockContext.jsx`.

The context stores:

- Watchlist items
- Generated predictions
- Latest prediction
- Loading state
- Error messages

This avoids passing data manually through many components. Pages like Dashboard, Predictor, and Watchlist can all access the same shared stock state.

## 7. Backend API

The Express backend is defined in `server/index.js`.

It provides these main routes:

```text
GET /api/health
```

Checks whether the backend is running and whether Firebase is connected.

```text
GET /api/predictions/:symbol
```

Generates a stock trend prediction for a ticker symbol.

```text
GET /api/watchlist
```

Returns saved watchlist items.

```text
POST /api/watchlist
```

Adds a new stock to the watchlist.

```text
DELETE /api/watchlist/:id
```

Deletes a saved watchlist item.

## 8. Firebase Role

Firebase is used as the database backend through Firestore.

The backend connects to Firebase using the Firebase Admin SDK. The service account credentials can be provided in two ways:

1. By placing a `firebase-service-account.json` file in the project root
2. By putting the full service account JSON inside the `FIREBASE_SERVICE_ACCOUNT` environment variable

The frontend also includes Firebase Web SDK setup in `src/firebase.js`, using values like:

```text
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_APP_ID
```

In this version of the app, the actual database operations are handled by the backend. This is a good pattern because the backend can securely use Firebase Admin credentials without exposing private keys to the browser.

## 9. Prediction Calculation

The prediction logic is located in:

```text
server/predictionService.js
```

This app does not use real live stock market data yet. Instead, it creates a deterministic simulated price series for each stock symbol. This makes the app easy to run locally and easy to demonstrate without needing a paid stock market API.

The calculation has four main steps:

1. Generate a 45-day price series
2. Calculate recent momentum
3. Calculate recent volatility
4. Convert those values into a trend, confidence score, and projected price

## 10. Step 1: Generate A Price Series

The backend starts with a base price for known symbols:

```js
const basePrices = {
  AAPL: 192.32,
  MSFT: 424.18,
  TSLA: 178.01,
  NVDA: 121.44
};
```

If the user enters a symbol that is not listed, the app creates a default base price from the ticker letters.

Then it generates 45 days of prices. Each price includes:

- A starting base price
- A small upward drift
- A cyclical movement created using sine and cosine functions

In simple terms, the app creates realistic-looking movement where the stock price rises and falls over time instead of staying flat.

## 11. Step 2: Calculate Momentum

The app looks at the last 10 days of the generated price series.

Momentum is calculated using:

```text
momentum = ((lastPrice - firstRecentPrice) / firstRecentPrice) * 100
```

Meaning:

- If the recent price increased, momentum is positive
- If the recent price decreased, momentum is negative
- If the price stayed almost the same, momentum is close to zero

Example:

```text
First recent price = 100
Last recent price = 105

Momentum = ((105 - 100) / 100) * 100
Momentum = 5%
```

So the stock has positive recent momentum.

## 12. Step 3: Calculate Volatility

Volatility measures how much the price moves from day to day.

The app checks the last 10 days and calculates the average absolute price change between consecutive days.

In simple terms:

- Low volatility means the price is moving smoothly
- High volatility means the price is moving sharply up and down

Volatility is important because a stock may have positive momentum, but if it is extremely unstable, the prediction should be less confident.

## 13. Step 4: Calculate The Score

The app combines momentum and volatility into a score:

```text
score = momentum - volatility * 0.12
```

This means:

- Momentum increases the score
- Volatility slightly reduces the score

The idea is that upward price movement is good, but unstable price movement adds risk.

## 14. Step 5: Decide The Trend

The score is converted into one of three trend labels:

```text
If score > 1.2       => Bullish
If score < -1.2      => Bearish
Otherwise            => Sideways
```

The meanings are:

- Bullish: the model expects upward movement
- Bearish: the model expects downward movement
- Sideways: the model expects no strong direction

## 15. Confidence Score

The confidence score is based on how strong the final score is.

```text
confidence = 64 + absoluteScore * 8
```

The value is limited between:

```text
Minimum: 56%
Maximum: 94%
```

So if the trend signal is stronger, the confidence becomes higher. If the signal is weak, the confidence stays lower.

## 16. Projected Price

The projected price is calculated from the latest price and the score:

```text
projectedPrice = latestPrice * (1 + score / 100)
```

Example:

```text
Latest price = 100
Score = 3

Projected price = 100 * (1 + 3 / 100)
Projected price = 103
```

So the model projects the price to move toward 103.

## 17. Important Presentation Note

This is a demonstration model, not a production financial model.

For a real-world stock market prediction system, the next steps would be:

- Connect to a real stock market API
- Store historical market prices in Firestore
- Use technical indicators like moving averages, RSI, MACD, and volume
- Train a machine learning model
- Add authentication for users
- Save personalized watchlists per user

## 18. Summary

This project demonstrates how a modern full-stack stock predictor can be structured using React, Express, and Firebase.

The frontend provides a clean user interface for predictions and watchlists. The backend handles API requests, prediction calculations, and database operations. Firebase Firestore stores watchlist data when credentials are configured.

The current prediction system uses simulated price data and a simple technical scoring formula based on momentum and volatility. This makes it suitable for presentation, learning, and future extension into a real market-data-based application.
