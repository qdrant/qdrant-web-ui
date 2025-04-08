import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  DialogContentText,
  Grid,
  TextField,
  Typography,
} from '@mui/material';
import { CopyButton } from '../Common/CopyButton';
import { bigIntJSON } from '../../common/bigIntJSON';
import { getSnackbarOptions } from '../Common/utils/snackbarOptions';
import { closeSnackbar, enqueueSnackbar } from 'notistack';
import { useClient } from '../../context/client-context';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';

const CollectionAliases = ({ collectionName }) => {
  const { client: qdrantClient } = useClient();
  const [openCreateModal, setOpenCreateModal] = React.useState(false);
  const [openDeleteModal, setOpenDeleteModal] = React.useState(false);
  const [aliases, setAliases] = React.useState([]);

  useEffect(() => {
    qdrantClient
      .getCollectionAliases(collectionName)
      .then((res) => {
        setAliases(() => {
          return res.aliases;
        });
      })
      .catch((err) => {
        enqueueSnackbar(err.message, getSnackbarOptions('error', closeSnackbar));
      });
  }, []);

  const deleteAlias = (aliasName) => {
    qdrantClient
      .updateCollectionAliases({
        actions: [
          {
            delete_alias: {
              alias_name: aliasName,
            },
          },
        ],
      })

      .then(() => {
        setAliases((prev) => {
          return prev.filter((alias) => alias.alias_name !== aliasName);
        });
        enqueueSnackbar('Alias deleted successfully', getSnackbarOptions('success', closeSnackbar, 2000));
      })
      .catch((err) => {
        enqueueSnackbar(err.message, getSnackbarOptions('error', closeSnackbar));
      });
  };

  const handleCreateAlias = (newAliasName) => {
    if (newAliasName.trim() === '') {
      enqueueSnackbar('Alias name cannot be empty', getSnackbarOptions('error', closeSnackbar, 2000));
      return;
    }

    qdrantClient
      .updateCollectionAliases({
        actions: [
          {
            create_alias: {
              collection_name: collectionName,
              alias_name: newAliasName,
            },
          },
        ],
      })
      .then(() => {
        setAliases((prev) => {
          return [...prev, { alias_name: newAliasName }];
        });
        setOpenCreateModal(false);
        enqueueSnackbar('Alias created successfully', getSnackbarOptions('success', closeSnackbar, 2000));
      })
      .catch((err) => {
        enqueueSnackbar(err.message, getSnackbarOptions('error', closeSnackbar));
      });
  };

  if (aliases.length === 0) {
    return (
      <React.Fragment>
        <Card variant="dual" sx={{ mb: 5 }}>
          <CardHeader
            title={'Aliases'}
            variant="heading"
            sx={{
              flexGrow: 1,
            }}
            action={
              <Box>
                <Button variant="outlined" size="small" onClick={() => setOpenCreateModal(true)}>
                  Create alias
                </Button>
              </Box>
            }
          />
          <CardContent>
            <Typography variant="subtitle1" color="text.secondary">
              No aliases found
            </Typography>
          </CardContent>
        </Card>
        <CreateAliasModal
          open={openCreateModal}
          onClose={() => setOpenCreateModal(false)}
          onCreate={handleCreateAlias}
        />
      </React.Fragment>
    );
  }

  return (
    <Card variant="dual" sx={{ mb: 5 }}>
      <CardHeader
        title={'Aliases'}
        variant="heading"
        sx={{
          flexGrow: 1,
        }}
        action={
          <Box>
            <Button variant="outlined" size="small" onClick={() => setOpenCreateModal(true)}>
              Create alias
            </Button>
            <CopyButton text={bigIntJSON.stringify(aliases)} />
          </Box>
        }
      />
      <CardContent>
        <Grid container spacing={2}>
          {aliases.map((alias) => (
            <React.Fragment key={alias.alias_name}>
              <Grid item xs={10}>
                <Typography variant="subtitle1" color="text.secondary">
                  {alias.alias_name}
                </Typography>
              </Grid>
              <Grid item xs={2} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <IconButton onClick={() => setOpenDeleteModal(true)} aria-label="delete" color="error">
                  <DeleteIcon />
                </IconButton>
                <Dialog
                  open={openDeleteModal}
                  onClose={() => setOpenDeleteModal(false)}
                  aria-labelledby="delete-dialog-title"
                  aria-describedby="delete-dialog-description"
                >
                  <DialogTitle id="delete-dialog-title">Delete Alias</DialogTitle>
                  <DialogContent>
                    <DialogContentText id="delete-dialog-description">
                      Are you sure you want to delete this alias?
                    </DialogContentText>
                  </DialogContent>
                  <DialogActions>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        deleteAlias(alias.alias_name);
                        setOpenDeleteModal(false);
                      }}
                    >
                      Delete
                    </Button>
                    <Button variant="outlined" size="small" onClick={() => setOpenDeleteModal(false)}>
                      Cancel
                    </Button>
                  </DialogActions>
                </Dialog>
              </Grid>
            </React.Fragment>
          ))}
        </Grid>
      </CardContent>

      <CreateAliasModal open={openCreateModal} onClose={() => setOpenCreateModal(false)} onCreate={handleCreateAlias} />
    </Card>
  );
};

CollectionAliases.propTypes = {
  collectionName: PropTypes.string.isRequired,
};

export default CollectionAliases;

const CreateAliasModal = ({ open, onClose, onCreate }) => {
  const [aliasName, setAliasName] = React.useState('');

  const handleCreate = () => {
    if (aliasName.trim() === '') {
      enqueueSnackbar('Alias name cannot be empty', getSnackbarOptions('error', closeSnackbar, 2000));
      return;
    }

    onCreate(aliasName);
    setAliasName('');
  };

  return (
    <Dialog fullWidth={true} open={open} onClose={onClose} aria-labelledby="create-alias-title">
      <Box sx={{ display: 'flex', flexDirection: 'column', padding: 2 }}>
        <DialogTitle id="create-alias-title">Create Collection Alias</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <TextField
              label="Alias Name"
              value={aliasName}
              onChange={(e) => setAliasName(e.target.value)}
              autoFocus
              required
              margin="dense"
              fullWidth
              variant="standard"
            />
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" size="small" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="contained" size="small" onClick={handleCreate}>
            Create
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

CreateAliasModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired,
};
