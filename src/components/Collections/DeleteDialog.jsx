import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import PropTypes from 'prop-types';
import { useClient } from '../../context/client-context';

import ErrorNotifier from '../ToastNotifications/ErrorNotifier';
import Box from '@mui/material/Box';

export default function DeleteDialog({ open, setOpen, collectionName, getCollectionsCall }) {
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { client: qdrantClient } = useClient();

  async function callDelete() {
    try {
      await qdrantClient.deleteCollection(collectionName);
      getCollectionsCall();
      setOpen(false);
      setHasError(false);
    } catch (error) {
      setErrorMessage(`Deletion Unsuccessful, error: ${error.message}`);
      setHasError(true);
      setOpen(false);
    }
  }

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      {hasError && <ErrorNotifier {...{ message: errorMessage }} />}
      <Dialog open={open} onClose={handleClose} aria-labelledby="Delete-collection-confirmation">
        <DialogTitle id="Delete-collection-confirmation">
          Do you want to{' '}
          <Box component="span" display={'inline'} sx={{ color: 'error.main' }}>
            Delete {collectionName}
          </Box>
          ?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            <Box display={'inline'} component="span" sx={{ color: 'error.main' }}>
              Warning:
            </Box>{' '}
            Deleting this database can result in irreversible data loss. Please proceed with caution and ensure that you
            have a backup of all the necessary data before proceeding. It is recommended to seek professional guidance
            to avoid any accidental loss of critical data.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={callDelete} color="error" variant="contained">
            Delete
          </Button>
          <Button autoFocus onClick={handleClose} color="success" variant="contained">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

DeleteDialog.propTypes = {
  collectionName: PropTypes.string.isRequired,
  setOpen: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  getCollectionsCall: PropTypes.func.isRequired,
};
