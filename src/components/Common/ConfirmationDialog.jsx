import React from 'react';
import PropTypes from 'prop-types';
import { Box, Button, Dialog, Typography, Alert } from '@mui/material';

const ConfirmationDialog = ({ open, onClose, title, content, warning, actionName, actionHandler }) => {
  const handleActionClick = () => {
    actionHandler();
    onClose();
  };

  return (
    <Dialog open={open} fullWidth={true}>
      <Box
        sx={{
          display: 'flex',
          p: 3,
        }}
      >
        <div>
          <Typography variant="h5">{title}</Typography>
          {content && (
            <Typography sx={{ mt: 2 }} variant="body1">
              {content}
            </Typography>
          )}
        </div>
      </Box>
      {warning && (
        <Box
          sx={{
            px: 3,
            mb: 2,
          }}
        >
          <Alert severity="error">
            <Typography color="error.main.dark" component={'span'}>
              <b>Warning:</b> {warning}
            </Typography>
          </Alert>
        </Box>
      )}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          px: 3,
          py: 3,
        }}
      >
        <Button size="medium" sx={{ mr: 2 }} variant="outlined" color="text.primary" onClick={onClose}>
          Cancel
        </Button>
        <Button
          size="medium"
          sx={
            warning
              ? {
                  backgroundColor: 'error.main',
                  '&:hover': {
                    backgroundColor: 'error.dark',
                  },
                }
              : {}
          }
          variant="contained"
          onClick={handleActionClick}
          data-testid={`confirm-${actionName.toLowerCase()}-button`}
        >
          {actionName}
        </Button>
      </Box>
    </Dialog>
  );
};

// propType validation
ConfirmationDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  content: PropTypes.string,
  warning: PropTypes.string,
  actionName: PropTypes.string.isRequired,
  actionHandler: PropTypes.func.isRequired,
};

export default ConfirmationDialog;
