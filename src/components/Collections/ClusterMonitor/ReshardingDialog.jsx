import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { JsonViewer } from '@textea/json-viewer';
import { CopyButton } from '../../Common/CopyButton';
import { useTheme } from '@mui/material/styles';
import ArrowUpward from '@mui/icons-material/ArrowUpward';
import ArrowDownward from '@mui/icons-material/ArrowDownward';

const ReshardingDialog = ({ open, onClose, direction, onConfirm, loading = false, collectionName, shardKeys = [] }) => {
  const theme = useTheme();
  const [selectedShardKey, setSelectedShardKey] = useState('');

  React.useEffect(() => {
    // Reset selection when dialog opens/closes
    if (!open) {
      setSelectedShardKey('');
    } else if (shardKeys.length > 0 && selectedShardKey === '') {
      // Auto-select first shard key if shard keys are present and none is selected
      setSelectedShardKey(shardKeys[0]);
    }
  }, [open, shardKeys]);

  if (!direction) {
    return null;
  }

  const isUp = direction === 'up';
  const hasShardKeys = shardKeys.length > 0;

  // Format the request payload for display
  const requestPayload = {
    start_resharding: {
      direction,
    },
  };

  // Add shard_key if shard keys are present (required) or if selected
  if (hasShardKeys && selectedShardKey !== '') {
    requestPayload.start_resharding.shard_key = selectedShardKey === 'null' ? null : selectedShardKey;
  }

  const requestString = JSON.stringify(requestPayload, null, 2);

  const handleConfirm = () => {
    // If shard keys are present, shard key is required
    if (hasShardKeys && selectedShardKey === '') {
      return; // Don't proceed if required shard key is not selected
    }
    const shardKeyValue = selectedShardKey === '' ? null : selectedShardKey === 'null' ? null : selectedShardKey;
    onConfirm(direction, shardKeyValue);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6" component="div">
          {isUp ? 'Reshard Up' : 'Reshard Down'}
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              This action will {isUp ? 'increase' : 'decrease'} the number of shards in the collection{' '}
              <strong>{collectionName}</strong>.
            </Typography>
            {isUp ? (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Resharding up will add a new shard to distribute data across more nodes, improving scalability and
                performance.
              </Typography>
            ) : (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Resharding down will remove a shard, consolidating data into fewer shards.
              </Typography>
            )}
          </Alert>

          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2" fontWeight="bold" sx={{ mb: 0.5 }}>
              Important considerations:
            </Typography>
            <Typography variant="body2" component="ul" sx={{ pl: 2, mb: 0, mt: 0.5 }}>
              <li>Performance may be slightly reduced during resharding</li>
              <li>Reported point counts will not be accurate during the operation</li>
              <li>Resharding may be a long-running operation on large collections</li>
              <li>Only one resharding operation can run per collection at a time</li>
            </Typography>
          </Alert>

          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2" fontWeight="bold">
                Request
              </Typography>
              <CopyButton
                text={`POST collections/${collectionName}/cluster\n${requestString}`}
                tooltip="Copy request to clipboard"
                successMessage="Request copied to clipboard"
              />
            </Box>

            <Box
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
                p: 1,
                backgroundColor: theme.palette.background.paper,
                fontFamily: 'monospace',
                fontSize: '0.875rem',
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.primary.main,
                  fontWeight: 'bold',
                  mb: 1,
                  fontFamily: 'monospace',
                }}
              >
                POST collections/{collectionName}/cluster
              </Typography>
              <JsonViewer
                value={requestPayload}
                theme={theme.palette.mode === 'dark' ? 'dark' : 'light'}
                style={{
                  backgroundColor: 'transparent',
                  fontSize: '0.875rem',
                }}
                enableClipboard={false}
                displayDataTypes={false}
                rootName={false}
              />
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', mb: 2 }}>
            {isUp ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />}
            <Typography variant="body2">
              Direction: <strong>{isUp ? 'Up (add shard)' : 'Down (remove shard)'}</strong>
            </Typography>
          </Box>

          {hasShardKeys && (
            <Box sx={{ mb: 2 }}>
              <FormControl fullWidth required>
                <InputLabel id="shard-key-select-label">Shard Key</InputLabel>
                <Select
                  labelId="shard-key-select-label"
                  id="shard-key-select"
                  value={selectedShardKey}
                  label="Shard Key *"
                  onChange={(e) => setSelectedShardKey(e.target.value)}
                  disabled={loading}
                  required
                >
                  {shardKeys.map((key) => (
                    <MenuItem key={key} value={key}>
                      {String(key)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                Select a shard key for this collection. This collection uses custom sharding.
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="primary"
          disabled={loading || (hasShardKeys && selectedShardKey === '')}
        >
          {loading ? 'Starting...' : `Confirm ${isUp ? 'Reshard Up' : 'Reshard Down'}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

ReshardingDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  direction: PropTypes.oneOf(['up', 'down']),
  onConfirm: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  collectionName: PropTypes.string.isRequired,
  shardKeys: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
};

export default ReshardingDialog;
