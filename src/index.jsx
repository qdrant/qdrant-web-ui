import { Button } from '@mui/material';
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { HashRouter } from 'react-router';
import { ClientProvider } from './context/client-context';
import { SnackbarProvider, closeSnackbar } from 'notistack';

const root = ReactDOM.createRoot(document.getElementById('root'));

function renderApp() {
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
}

// Set up MSW (Mock Service Worker) to intercept network requests in development
// and provide mock responses, so the app can run without a real backend.
// Enable with `npm run dev:msw`. We must wait for the worker to be ready before
// rendering, otherwise the first requests escape to the real backend.
// The msw imports are dynamic and live behind the dev guard, so they are tree
// shaken out of production builds and never leak into production.
async function enableMocking() {
  if (process.env.NODE_ENV !== 'development' || import.meta.env.VITE_DEV_WITH_MSW !== 'true') {
    return;
  }
  const { setupWorker } = await import('msw/browser');
  const { requestHandlers } = await import('./mocks/request-handlers');
  console.log('Running in development mode with MSW enabled');
  const worker = setupWorker(...requestHandlers);
  await worker.start();
}

enableMocking()
  .catch(console.error)
  .finally(() => renderApp());

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
