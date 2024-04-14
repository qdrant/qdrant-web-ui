/* eslint-disable no-unused-vars */

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useClient } from '../../context/client-context';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
  FormControlLabel,
  Switch,
  TextField,
  Typography,
  IconButton,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from '@mui/material';

import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

function CollectionAccessDialog({ show, setShow, onSave, initState, collectionInfo }) {
  const [isAccessible, setIsAccessible] = React.useState(false);
  const [isWritable, setIsWritable] = React.useState(false);
  const [collections, setCollections] = React.useState([]);

  const [selectedCollection, setSelectedCollection] = React.useState(collectionInfo);

  const { client: qdrantClient } = useClient();

  const [payloadFilters, setPayloadFilters] = React.useState({});

  const [newPayloadFilterKey, setNewPayloadFilterKey] = React.useState('');
  const [newPayloadFilterValue, setNewPayloadFilterValue] = React.useState('');

  useEffect(() => {
    setPayloadFilters({});
  }, [selectedCollection]);

  useEffect(() => {
    if (!collectionInfo) {
      const fetchCollections = async () => {
        setCollections((await qdrantClient.getCollections()).collections);
      };
      fetchCollections();
    }
  }, [show]);

  useEffect(() => {
    if (initState) {
      setIsAccessible(initState?.isAccessible || false);
      setIsWritable(initState?.isWritable || false);
      setPayloadFilters(initState?.payloadFilters || {});
    }
    setNewPayloadFilterKey('');
    setNewPayloadFilterValue('');
  }, [show, initState]);

  const availablePayloadKeys = Object.keys(selectedCollection?.payload_schema || {});

  return (
    <Dialog fullWidth open={show} onClose={() => setShow(false)}>
      <DialogTitle>Access Settings</DialogTitle>
      <DialogContent>
        {collections && !collectionInfo && (
          <Box sx={{ display: 'flex', gap: 2, mb: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel id="collection-select-label">Collection</InputLabel>
              <Select
                id="collection-select"
                labelId="collection-select-label"
                label="Collection"
                value={selectedCollection?.name || ''}
                onChange={(e) => {
                  if (e.target.value === '') {
                    setSelectedCollection({});
                    return;
                  }
                  qdrantClient.getCollection(e.target.value).then((collection) => {
                    setSelectedCollection({
                      name: e.target.value,
                      ...collection,
                    });
                  });
                }}
              >
                <MenuItem value="" key="">
                  Not Selected
                </MenuItem>
                {collections.map((collection) => (
                  <MenuItem key={collection.name} value={collection.name}>
                    {collection.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        )}

        <Box>
          <FormControlLabel
            control={<Switch checked={isAccessible} onChange={(e) => setIsAccessible(e.target.checked)} />}
            label="Allow access"
          />
        </Box>

        <Box sx={{ mb: 1 }}>
          <FormControlLabel
            disabled={!isAccessible}
            control={<Switch checked={isWritable} onChange={(e) => setIsWritable(e.target.checked)} />}
            label="Allow write operations"
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" color={isAccessible ? 'textPrimary' : 'textSecondary'}>
            Payload Filters
          </Typography>
        </Box>

        {Object.keys(payloadFilters).map((key) => {
          return (
            <Box sx={{ display: 'flex', gap: 2, mb: 2, '& > :not(:last-of-type)': { width: '40%' } }} key={key}>
              <TextField disabled label="Key" value={key} />
              <TextField disabled label="Value" value={payloadFilters[key]} />
              <IconButton
                aria-label="delete"
                size="large"
                onClick={() => {
                  const newPayloadFilters = { ...payloadFilters };
                  delete newPayloadFilters[key];
                  setPayloadFilters(newPayloadFilters);
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          );
        })}

        <Box sx={{ display: 'flex', gap: 2, '& > :not(:last-of-type)': { width: '40%' } }}>
          <FormControl>
            <InputLabel id="filter-key-slect-label">Payload Key</InputLabel>
            <Select
              id="filter-key-select"
              labelId="filter-key-slect-label"
              disabled={!isAccessible || isWritable || availablePayloadKeys.length === 0}
              label="Payload Key"
              value={newPayloadFilterKey}
              onChange={(e) => setNewPayloadFilterKey(e.target.value)}
            >
              {availablePayloadKeys.map((key) => (
                <MenuItem key={key} value={key}>
                  {key}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Value"
            disabled={!isAccessible || isWritable || availablePayloadKeys.length === 0}
            value={newPayloadFilterValue}
            onChange={(e) => setNewPayloadFilterValue(e.target.value)}
          />
          <IconButton
            aria-label="delete"
            size="large"
            disabled={!isAccessible || isWritable}
            onClick={() => {
              setPayloadFilters({
                ...payloadFilters,
                [newPayloadFilterKey]: newPayloadFilterValue,
              });
              setNewPayloadFilterKey('');
              setNewPayloadFilterValue('');
            }}
          >
            <AddIcon />
          </IconButton>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, mt: 1 }}>
          {availablePayloadKeys.length === 0 && (
            <Typography variant="body2" color="red">
              Note: No indexed field present in this collection!
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShow(false)}>Cancel</Button>
        <Button
          onClick={() => {
            onSave({
              isAccessible,
              isWritable,
              payloadFilters,
              selectedCollection: selectedCollection.name,
            });
            setShow(false);
          }}
        >
          Save
        </Button>
      </DialogActions>{' '}
    </Dialog>
  );
}

CollectionAccessDialog.propTypes = {
  show: PropTypes.bool.isRequired,
  setShow: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  initState: PropTypes.object,
  collectionInfo: PropTypes.object,
};

export default CollectionAccessDialog;
