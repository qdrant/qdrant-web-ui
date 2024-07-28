import { Button } from '@mui/material';
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { HashRouter } from 'react-router-dom';
import { ClientProvider } from './context/client-context';
import { SnackbarProvider, closeSnackbar } from 'notistack';

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
