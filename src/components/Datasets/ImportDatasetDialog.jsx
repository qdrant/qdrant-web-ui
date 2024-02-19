import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Button, Dialog, Input, Typography } from '@mui/material';

const ImportDatasetDialog = ({ open, onClose, content, actionHandler, fileName, setImporting, importing }) => {
  const [collectionName, setCollectionName] = useState('');
  const handleActionClick = () => {
    actionHandler(fileName, collectionName, setImporting, importing);
    onClose();
    setCollectionName('');
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
          <Typography variant="h5">Enter collection name</Typography>
          <Typography color="textSecondary" sx={{ mt: 2 }} variant="body1">
            {content}
          </Typography>
        </div>
      </Box>
      <Input
        sx={{ mx: 3, mb: 3 }}
        placeholder="Collection Name"
        value={collectionName}
        onChange={(e) => setCollectionName(e.target.value)}
      />

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
          sx={{
            backgroundColor: 'success.main',
            '&:hover': {
              backgroundColor: 'success.dark',
            },
          }}
          variant="contained"
          onClick={handleActionClick}
          disabled={!collectionName}
        >
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
