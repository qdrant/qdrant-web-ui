import React, { useEffect, useState, useCallback, useMemo } from 'react';
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
  Divider,
  Grid,
  TextField,
  Typography,
  IconButton,
  Tooltip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ConfirmationDialog from '../Common/ConfirmationDialog';
import { getSnackbarOptions } from '../Common/utils/snackbarOptions';
import { closeSnackbar, enqueueSnackbar } from 'notistack';
import { useClient } from '../../context/client-context';
import { CopyButton } from '../Common/CopyButton';

const CollectionAliases = ({ collectionName }) => {
  const { client: qdrantClient } = useClient();
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [aliasToDelete, setAliasToDelete] = useState('');
  const [aliases, setAliases] = useState([]);

  // Fetch aliases on mount
  useEffect(() => {
    const fetchAliases = async () => {
      try {
        const res = await qdrantClient.getCollectionAliases(collectionName);
        setAliases(res.aliases || []);
      } catch (err) {
        enqueueSnackbar(err.message, getSnackbarOptions('error', closeSnackbar));
      }
    };
    fetchAliases().catch((e) => console.error(e));
  }, [collectionName, qdrantClient]);

  // Delete alias handler
  const deleteAlias = useCallback(
    async (aliasName) => {
      try {
        await qdrantClient.updateCollectionAliases({
          actions: [{ delete_alias: { alias_name: aliasName } }],
        });
        setAliases((prev) => prev.filter((alias) => alias.alias_name !== aliasName));
        enqueueSnackbar('Alias deleted successfully', getSnackbarOptions('success', closeSnackbar, 2000));
      } catch (err) {
        enqueueSnackbar(err.message, getSnackbarOptions('error', closeSnackbar));
      }
    },
    [qdrantClient]
  );

  // Create alias handler
  const handleCreateAlias = useCallback(
    async (newAliasName) => {
      const newAliasNameNormalized = newAliasName.trim();

      // if alias name already exists
      if (aliases.some((alias) => alias.alias_name === newAliasNameNormalized)) {
        enqueueSnackbar('Alias name already exists', getSnackbarOptions('error', closeSnackbar, 2000));
        setOpenCreateModal(false);
        return;
      }
      // if alias name is empty
      if (!newAliasNameNormalized) {
        enqueueSnackbar('Alias name cannot be empty', getSnackbarOptions('error', closeSnackbar, 2000));
        return;
      }

      try {
        await qdrantClient.updateCollectionAliases({
          actions: [{ create_alias: { collection_name: collectionName, alias_name: newAliasNameNormalized } }],
        });
        setAliases((prev) => [...prev, { alias_name: newAliasNameNormalized }]);
        setOpenCreateModal(false);
        enqueueSnackbar('Alias created successfully', getSnackbarOptions('success', closeSnackbar, 2000));
      } catch (err) {
        enqueueSnackbar(err.message, getSnackbarOptions('error', closeSnackbar));
      }
    },
    [collectionName, qdrantClient, aliases]
  );

  const aliasList = useMemo(
    () =>
      aliases.map((alias) => (
        <React.Fragment key={alias.alias_name}>
          <AliasRow aliasName={alias.alias_name} onDelete={() => setAliasToDelete(alias.alias_name)} />
          {alias.alias_name !== aliases[aliases.length - 1].alias_name && (
            <Divider sx={{ ml: '0.5rem', width: 'calc(100% - 0.5rem)' }} />
          )}
        </React.Fragment>
      )),
    [aliases]
  );

  return (
    <Card elevation={0} sx={{ mb: 5 }}>
      <CardHeader
        title="Aliases"
        variant="heading"
        action={
          <Box>
            <Button
              variant="contained"
              size="small"
              sx={{ py: 0.75, mb: 0.2 }}
              onClick={() => setOpenCreateModal(true)}
            >
              Create alias
            </Button>
          </Box>
        }
      />
      <CardContent sx={{ '&:last-child': { pb: 1 } }}>
        {aliases.length === 0 ? (
          <Typography variant="subtitle1" color="text.secondary">
            No aliases found
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {aliasList}
          </Grid>
        )}
      </CardContent>
      <CreateAliasModal open={openCreateModal} onClose={() => setOpenCreateModal(false)} onCreate={handleCreateAlias} />

      <ConfirmationDialog
        open={!!aliasToDelete}
        onClose={() => setAliasToDelete('')}
        title={'Delete Alias'}
        content={`Are you sure you want to delete the alias ${aliasToDelete}?`}
        warning={`This action cannot be undone.`}
        actionName={'Delete'}
        actionHandler={() => {
          deleteAlias(aliasToDelete).catch((e) => console.error(e));
          setAliasToDelete('');
        }}
      />
    </Card>
  );
};

const AliasRow = ({ aliasName, onDelete }) => (
  <React.Fragment>
    <Grid item xs={10} display="flex" alignItems="center" sx={{ pb: 1 }}>
      <Typography variant="subtitle1" color="text.secondary">
        {aliasName}
      </Typography>
      <CopyButton text={aliasName} tooltipPlacement={'right'} />
    </Grid>
    <Grid item xs={2} sx={{ display: 'flex', justifyContent: 'flex-end', pr: 2 }}>
      <Tooltip title={'Delete alias'} placement={'left'}>
        <IconButton onClick={onDelete} aria-label="delete" color="error" data-testid={`delete-alias-${aliasName}`}>
          <DeleteIcon />
        </IconButton>
      </Tooltip>
    </Grid>
  </React.Fragment>
);

AliasRow.propTypes = {
  aliasName: PropTypes.string.isRequired,
  onDelete: PropTypes.func.isRequired,
};

const CreateAliasModal = ({ open, onClose, onCreate }) => {
  const [aliasName, setAliasName] = useState('');

  const handleCreate = () => {
    onCreate(aliasName);
    setAliasName('');
  };

  return (
    <Dialog
      fullWidth
      open={open}
      onClose={onClose}
      aria-labelledby="create-alias-title"
      data-testid="create-alias-dialog"
      role="dialog"
    >
      <DialogTitle sx={{ p: 3 }} id="create-alias-title">
        Create Collection Alias
      </DialogTitle>
      <DialogContent>
        <TextField
          id="alias-name-input"
          data-testid="alias-name-input"
          label="Alias Name"
          value={aliasName}
          onChange={(e) => setAliasName(e.target.value)}
          autoFocus
          required
          margin="dense"
          fullWidth
          variant="outlined"
        />
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button variant="outlined" color="inherit" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="contained" disabled={!aliasName} onClick={handleCreate} data-testid="create-alias-button">
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};

CreateAliasModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired,
};

CollectionAliases.propTypes = {
  collectionName: PropTypes.string.isRequired,
};

export default CollectionAliases;
