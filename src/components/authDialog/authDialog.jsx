import React from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useClient } from '../../context/client-context';
import qdrantClient from '../../common/client';
import { getErrorMessage } from '../../lib/get-error-message';

export function ApiKeyDialog({ open, setOpen, required = false }) {
  const { settings, setSettings } = useClient();
  const [showApiKey, setShowApiKey] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [isValidating, setIsValidating] = React.useState(false);

  const handleClickShowApiKey = () => setShowApiKey((show) => !show);

  const handleMouseDown = (event) => {
    event.preventDefault();
  };

  const [apiKey, setApiKey] = React.useState('');

  const handleClose = () => {
    // When a key is required, the dialog can only be closed by applying a valid key.
    if (isValidating || required) {
      return;
    }
    setError(null);
    setOpen(false);
  };

  const handleApply = async () => {
    if (isValidating) {
      return;
    }
    if (!apiKey) {
      setError('API Key is required');
      return;
    }

    // Check the key against the server before applying it,
    // so a rejected key is never silently saved.
    setIsValidating(true);
    try {
      await qdrantClient({ apiKey }).getCollections();
    } catch (e) {
      setError(
        e?.status === 401 || e?.status === 403
          ? 'API Key is invalid. Please check it and try again.'
          : getErrorMessage(e, { fallbackMessage: 'Could not verify API Key.' })
      );
      setIsValidating(false);
      return;
    }
    setIsValidating(false);

    setError(null);
    setSettings({ ...settings, apiKey });
    setOpen(false);
  };

  return (
    <div>
      <Dialog
        open={open}
        onClose={handleClose}
        slotProps={{
          transition: {
            onEntered: () => {
              const input = document.getElementById('api-key-input');
              if (input) {
                input.focus();
              }
            },
          },
        }}
      >
        <DialogTitle>Set API Key</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            This instance of Qdrant might be protected by an API Key. If so, please enter your API Key to continue.
          </DialogContentText>
          <TextField
            onChange={(e) => {
              setApiKey(e.target.value);
              setError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleApply();
              }
            }}
            autoFocus
            id="api-key-input"
            placeholder="API Key"
            error={Boolean(error)}
            helperText={error || ''}
            disabled={isValidating}
            type={showApiKey ? 'text' : 'password'}
            fullWidth
            variant="outlined"
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowApiKey}
                      onMouseDown={handleMouseDown}
                    >
                      {showApiKey ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          {!required && (
            <Button variant="outlined" color="inherit" onClick={handleClose} disabled={isValidating}>
              Cancel
            </Button>
          )}
          <Button variant="contained" onClick={handleApply} loading={isValidating}>
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

ApiKeyDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
  required: PropTypes.bool,
};
