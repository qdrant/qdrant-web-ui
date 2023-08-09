import React from 'react';
import { Button } from '@mui/material';

export const getSnackbarOptions = (variant, closeSnackbar, autoHideDuration = null) => ({
  variant: variant,
  autoHideDuration: autoHideDuration,
  preventDuplicate: true,
  action: (key) => (
    <Button
      variant="outlined"
      color="inherit"
      onClick={() => {
        closeSnackbar(key);
      }}
    >
      Dismiss
    </Button>
  ),
});
