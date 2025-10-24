import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Button, Dialog, TextField, Typography } from '@mui/material';

const ImportDatasetDialog = ({ open, onClose, content, actionHandler, fileName, setImporting, importing }) => {
  const [collectionName, setCollectionName] = useState('');
  const [error, setError] = useState(false);

  const handleActionClick = () => {
    if (!collectionName) {
      setError(true);
      return;
    }
    actionHandler(fileName, collectionName, setImporting, importing);
    handleClose();
    setCollectionName('');
  };

  const handleClose = () => {
    setCollectionName('');
    setError(false);
    onClose();
  };

  const handleInputChange = (e) => {
    if (e.target.value && error) {
      setError(false);
    }
    setCollectionName(e.target.value);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth={true}
      slotProps={{
        transition: {
          onEntered: () => {
            const input = document.getElementById('collection-name-input');
            if (input) {
              input.focus();
            }
          },
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          p: 3,
        }}
      >
        <div>
          <Typography variant="h5">Import Dataset</Typography>
          <Typography color="textSecondary" sx={{ mt: 2 }} variant="body1">
            {content}
          </Typography>
        </div>
      </Box>
      <TextField
        sx={{ mx: 3, mb: 3 }}
        id="collection-name-input"
        variant="outlined"
        placeholder="Collection Name"
        value={collectionName}
        error={error}
        helperText={error ? 'Collection name is required' : ''}
        onChange={handleInputChange}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleActionClick();
          }
        }}
      />

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          px: 3,
          py: 3,
        }}
      >
        <Button sx={{ mr: 1 }} variant="outlined" color="inherit" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleActionClick} disabled={!collectionName}>
          Import Dataset
        </Button>
      </Box>
    </Dialog>
  );
};

// propType validation
ImportDatasetDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  content: PropTypes.string.isRequired,
  actionHandler: PropTypes.func.isRequired,
  fileName: PropTypes.string.isRequired,
  setImporting: PropTypes.func.isRequired,
  importing: PropTypes.bool.isRequired,
};

export default ImportDatasetDialog;
