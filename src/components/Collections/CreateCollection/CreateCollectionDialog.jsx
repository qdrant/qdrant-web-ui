import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { CreateCollectionForm } from 'create-collection-form';
import { AppBar, Box, Dialog, Toolbar, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '@mui/material/styles';
import { useClient } from '../../../context/client-context';
import { createCollection } from './create-collection.js';
import { closeSnackbar, enqueueSnackbar } from 'notistack';
import { getSnackbarOptions } from '../../Common/utils/snackbarOptions';

const CreateCollectionDialog = ({ open, handleClose }) => {
  const { client: qdrantClient } = useClient();
  const theme = useTheme();
  const dialogRef = React.useRef();

  const getScrollableParent = () => {
    if (dialogRef.current) {
      return dialogRef.current.querySelector('.MuiPaper-root');
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
    <Dialog
      fullScreen
      open={open}
      ref={dialogRef}
      onClose={handleClose}
      aria-labelledby="create-collection-dialog-title"
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: theme.palette.mode === 'dark' ? '#0b0f19' : '#f3f8fd',
        }}
      >
        <AppBar
          sx={{
            background: theme.palette.mode === 'dark' ? '#111827' : theme.palette.background.default,
            boxShadow: 'none',
            borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
            position: 'sticky',
          }}
        >
          <Toolbar>
            <IconButton edge="start" color="default" onClick={handleClose} aria-label="close">
              <CloseIcon />
            </IconButton>
            <Typography
              id="create-collection-dialog-title"
              sx={{
                ml: 4,
                flex: 1,
                color: theme.palette.mode === 'dark' ? theme.palette.grey['50'] : theme.palette.grey['900'],
              }}
              variant="h6"
              component="div"
            >
              Create New Collection
            </Typography>
          </Toolbar>
        </AppBar>

        <CreateCollectionForm
          onFinish={handleFinish}
          hideSidebar={true}
          scrollableParent={getScrollableParent}
          aria-label="Create Collection Form"
          aria-role="dialog"
        />
      </Box>
    </Dialog>
  );
};

CreateCollectionDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
};

export default CreateCollectionDialog;
