import React from 'react';
import PropTypes from 'prop-types';
import { CreateCollectionForm } from 'create-collection-form';
import { AppBar, Box, Dialog, Toolbar, Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '@mui/material/styles';
import { useClient } from '../../../context/client-context';
import { createCollection } from './create-collection.js';
import { closeSnackbar, enqueueSnackbar } from 'notistack';
import { getSnackbarOptions } from '../../Common/utils/snackbarOptions';

const CreateCollectionDialog = ({ open, handleClose }) => {
  const { client: qdrantClient } = useClient();
  const theme = useTheme();

  const handleFinish = async (data) => {
    createCollection(qdrantClient, data).catch((e) => {
      enqueueSnackbar(e.message, getSnackbarOptions('warning', closeSnackbar, 2000));
    });
    handleClose();
  };

  return (
    <Dialog fullScreen open={open} onClose={handleClose}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          pt: 8,
          backgroundColor: theme.palette.mode === 'dark' ? '#0b0f19' : '#f3f8fd',
        }}
      >
        <AppBar
          position="fixed"
          sx={{
            zIndex: (theme) => theme.zIndex.drawer + 1,
            background: theme.palette.mode === 'dark' ? '#111827' : theme.palette.background.default,
            boxShadow: 'none',
            borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          <Toolbar>
            <IconButton edge="start" color="default" onClick={handleClose} aria-label="close">
              <CloseIcon />
            </IconButton>
            <Typography
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
