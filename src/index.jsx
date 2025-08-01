import { Button } from '@mui/material';
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { HashRouter } from 'react-router-dom';
import { ClientProvider } from './context/client-context';
import { SnackbarProvider, closeSnackbar } from 'notistack';

import { setupWorker } from 'msw/browser';
import { requestHandlers } from './mocks/request-handlers';

// This code is used to set up MSW (Mock Service Worker)
// for intercepting network requests in development mode and providing mock responses.
// It is useful for testing and development without needing a real backend.
// To use this feature, run the app with: `npm run dev:msw`
// Be careful to not leak this into production!
if (process.env.NODE_ENV === 'development' && import.meta.env.VITE_DEV_WITH_MSW === 'true') {
  console.log('Running in development mode with MSW enabled');
  const worker = setupWorker(...requestHandlers);
  worker.start().catch(console.error);
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <HashRouter>
      <ClientProvider>
        <SnackbarProvider
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
          style={{ flexWrap: 'nowrap' }}
          action={(snackbarId) => (
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => {
                closeSnackbar(snackbarId);
              }}
            >
              Dismiss
            </Button>
          )}
        >
          <App />
        </SnackbarProvider>
      </ClientProvider>
    </HashRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
