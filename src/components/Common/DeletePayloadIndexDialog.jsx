import React from 'react';
import PropTypes from 'prop-types';
import { useClient } from '../../context/client-context';
import ConfirmationDialog from './ConfirmationDialog';
import { enqueueSnackbar, closeSnackbar } from 'notistack';
import { getSnackbarOptions } from './utils/snackbarOptions';

/**
 * Confirmation dialog for deleting a payload index. Rendered only while
 * fieldName is set; pass null to keep it closed.
 *
 * @param {Object} props - Component props
 * @param {string} props.collectionName - Collection the index belongs to
 * @param {string|null} props.fieldName - Field whose index to delete; null keeps the dialog closed
 * @param {Function} props.onClose - Called when the dialog closes
 * @param {Function} props.onSuccess - Called after the index is deleted
 * @return {JSX.Element|null} Confirmation dialog or null
 */
const DeletePayloadIndexDialog = ({ collectionName, fieldName, onClose, onSuccess }) => {
  const { client: qdrantClient } = useClient();

  if (!fieldName) {
    return null;
  }

  const handleDelete = async () => {
    try {
      await qdrantClient.deletePayloadIndex(collectionName, fieldName, { wait: true });
      enqueueSnackbar(`Index deleted for "${fieldName}"`, getSnackbarOptions('success', closeSnackbar, 2000));
      onSuccess?.();
    } catch (err) {
      enqueueSnackbar(err?.message || 'Failed to delete index', getSnackbarOptions('error', closeSnackbar));
    }
  };

  return (
    <ConfirmationDialog
      open={true}
      onClose={onClose}
      title={`Delete index for "${fieldName}"?`}
      warning={'Filters on this field will no longer use an index and may be slow on large collections.'}
      actionName={'Delete'}
      actionHandler={handleDelete}
    />
  );
};

DeletePayloadIndexDialog.propTypes = {
  collectionName: PropTypes.string.isRequired,
  fieldName: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
};

export default DeletePayloadIndexDialog;
