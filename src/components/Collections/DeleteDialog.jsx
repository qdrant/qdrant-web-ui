import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useClient } from '../../context/client-context';
import ErrorNotifier from '../ToastNotifications/ErrorNotifier';
import ConfirmationDialog from '../Common/ConfirmationDialog';

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
    <>
      {hasError && <ErrorNotifier {...{ message: errorMessage }} />}
      <ConfirmationDialog
        open={open}
        onClose={handleClose}
        title={'Do you want to delete ' + collectionName + '?'}
        warning={
          'Deleting a collection cannot be undone. ' +
          'Make sure you have backed up all important data before proceeding.'
        }
        actionName={'Delete'}
        actionHandler={callDelete}
        aria-label="Delete Collection Confirmation Dialog"
      />
    </>
  );
}

DeleteDialog.propTypes = {
  collectionName: PropTypes.string.isRequired,
  setOpen: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  getCollectionsCall: PropTypes.func.isRequired,
};
