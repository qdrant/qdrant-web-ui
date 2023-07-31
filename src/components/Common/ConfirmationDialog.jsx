import React from 'react';
import PropTypes from 'prop-types';
import { Box, Button, Dialog, Typography } from '@mui/material';

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
          <Typography color="textSecondary" sx={{ mt: 2 }} variant="body1">
            {content}
          </Typography>
        </div>
      </Box>
      {warning && (
        <Box
          sx={{
            px: 3,
            mb: 2,
          }}
        >
          <Typography color="error.main" component={'span'}>
            Warning: {warning}
          </Typography>
        </Box>
      )}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          px: 3,
          py: 1.5,
        }}
      >
        <Button sx={{ mr: 2 }} variant="outlined" onClick={onClose}>
          Cancel
        </Button>
        <Button
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
  content: PropTypes.string.isRequired,
  warning: PropTypes.string,
  actionName: PropTypes.string.isRequired,
  actionHandler: PropTypes.func.isRequired,
};

export default ConfirmationDialog;
