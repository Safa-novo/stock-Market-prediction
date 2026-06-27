import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import './styles.css';
import App from './App.jsx';
import { StockProvider } from './state/StockContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MantineProvider defaultColorScheme="light">
      <BrowserRouter>
        <StockProvider>
          <App />
        </StockProvider>
      </BrowserRouter>
    </MantineProvider>
  </React.StrictMode>
);
