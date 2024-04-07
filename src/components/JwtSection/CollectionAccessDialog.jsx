/* eslint-disable no-unused-vars */

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Box,
  FormControlLabel,
  Switch,
  TextField,
  Typography,
  IconButton,
} from '@mui/material';

import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

function CollectionAccessDialog({ show, setShow, onSave, initState }) {
  const [isAccessible, setIsAccessible] = React.useState(false);
  const [isWritable, setIsWritable] = React.useState(false);

  const [payloadFilters, setPayloadFilters] = React.useState({});

  const [newPayloadFilterKey, setNewPayloadFilterKey] = React.useState('');
  const [newPayloadFilterValue, setNewPayloadFilterValue] = React.useState('');

  useEffect(() => {
    if (initState) {
      setIsAccessible(initState?.isAccessible || false);
      setIsWritable(initState?.isWritable || false);
      setPayloadFilters(initState?.payloadFilters || {});
    }
    setNewPayloadFilterKey('');
    setNewPayloadFilterValue('');
  }, [show, initState]);

  return (
    <Dialog fullWidth open={show} onClose={() => setShow(false)}>
      <DialogTitle>Access Settings</DialogTitle>
      <DialogContent>
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
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }} key={key}>
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

        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label="Key"
            disabled={!isAccessible || isWritable}
            value={newPayloadFilterKey}
            onChange={(e) => setNewPayloadFilterKey(e.target.value)}
          />
          <TextField
            label="Value"
            disabled={!isAccessible || isWritable}
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
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShow(false)}>Cancel</Button>
        <Button
          onClick={() => {
            onSave({
              isAccessible,
              isWritable,
              payloadFilters,
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
};

export default CollectionAccessDialog;
