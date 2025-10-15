import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { CreateCollectionForm } from 'create-collection-form';
import { AppBar, Dialog, Toolbar, Typography, IconButton } from '@mui/material';
import { ArrowLeft } from 'lucide-react';
import { useTheme } from '@mui/material/styles';
import { useClient } from '../../../context/client-context';
import { createCollection } from './create-collection.js';
import { closeSnackbar, enqueueSnackbar } from 'notistack';
import { getSnackbarOptions } from '../../Common/utils/snackbarOptions';
import DialogContent from '@mui/material/DialogContent';

const CreateCollectionDialog = ({ open, handleClose }) => {
  const { client: qdrantClient } = useClient();
  const theme = useTheme();
  const dialogRef = React.useRef();

  const getScrollableParent = () => {
    if (dialogRef.current) {
      return dialogRef.current;
    }
    return window;
  };

  // This function has to return a promise that resolves to a value,
  // as it is used as `onFinish` prop for CreateCollectionForm.
  // otherwise, the form will not be cleared (for example, if an error occurs).
  const handleFinish = useCallback(
    async (data) => {
      let result = null;
      try {
        result = await createCollection(qdrantClient, data);
      } catch (e) {
        enqueueSnackbar(e.message, getSnackbarOptions('warning', closeSnackbar, 2000));
      } finally {
        handleClose();
      }
      return result;
    },
    [qdrantClient, handleClose]
  );

  return (
    <Dialog fullScreen open={open} onClose={handleClose} aria-labelledby="create-collection-dialog-title">
      <AppBar
        sx={{
          background: theme.palette.background.paperElevation1,
          boxShadow: 'none',
          borderBottom: `1px solid ${theme.palette.divider}`,
          position: 'sticky',
        }}
      >
        <Toolbar
          sx={{
            width: '848px',
            maxWidth: '848px',
            minHeight: '48px',
            px: 2,
            py: 0.5,
            mx: 'auto',
          }}
        >
          <IconButton edge="start" color="default" onClick={handleClose} aria-label="close">
            <ArrowLeft size={24} />
          </IconButton>
          <Typography
            id="create-collection-dialog-title"
            sx={{
              ml: 1,
              flex: 1,
              color: theme.palette.text.primary,
            }}
            variant="body1"
            component="div"
          >
            Create New Collection
          </Typography>
        </Toolbar>
      </AppBar>

      <DialogContent
        ref={dialogRef}
        sx={{
          p: 0,
          backgroundColor: theme.palette.background.default,
        }}
      >
        <CreateCollectionForm
          onFinish={handleFinish}
          hideSidebar={true}
          scrollableParent={getScrollableParent}
          aria-label="Create Collection Form"
          aria-role="dialog"
        />
      </DialogContent>
    </Dialog>
  );
};

CreateCollectionDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
};

export default CreateCollectionDialog;
