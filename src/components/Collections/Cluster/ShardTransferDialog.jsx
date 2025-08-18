import React from 'react';
import PropTypes from 'prop-types';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography, 
  Box,
  Alert
} from '@mui/material';
import { JsonViewer } from '@textea/json-viewer';
import { CopyButton } from '../../Common/CopyButton';
import { useTheme } from '@mui/material/styles';

const ShardTransferDialog = ({ 
  open, 
  onClose, 
  transferRequest, 
  onConfirm,
  loading = false,
  collectionName
}) => {
  const theme = useTheme();

  if (!transferRequest) {
    return null;
  }

  const { shard, fromPeerId, toPeerId } = transferRequest;
  
  // Format the request payload for display
  const requestPayload = {
    move_shard: {
      shard_id: shard.shard_id,
      to_peer_id: toPeerId,
      from_peer_id: fromPeerId,
    }
  };

  const requestString = JSON.stringify(requestPayload, null, 2);

  const handleConfirm = () => {
    onConfirm(transferRequest);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Typography variant="h6" component="div">
          Transfer Shard
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              This action will move shard {shard.shard_id} from peer {fromPeerId} to peer {toPeerId}.
              {shard.shard_key && ` Shard key: ${shard.shard_key}`}
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
                fontSize: '0.875rem'
              }}
            >
              <Typography 
                variant="body2" 
                sx={{ 
                  color: theme.palette.primary.main,
                  fontWeight: 'bold',
                  mb: 1,
                  fontFamily: 'monospace'
                }}
              >
                POST collections/{collectionName}/cluster
              </Typography>
              <JsonViewer 
                value={requestPayload}
                theme={theme.palette.mode === 'dark' ? 'dark' : 'light'}
                style={{ 
                  backgroundColor: 'transparent',
                  fontSize: '0.875rem'
                }}
                enableClipboard={false}
                displayDataTypes={false}
                rootName={false}
              />
            </Box>
          </Box>

          <Box>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
              Shard Details
            </Typography>
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: 'auto 1fr', 
              gap: 1,
              fontSize: '0.875rem'
            }}>
              <Typography variant="body2" color="text.secondary">ID:</Typography>
              <Typography variant="body2">{shard.shard_id}</Typography>
              
              <Typography variant="body2" color="text.secondary">State:</Typography>
              <Typography variant="body2" sx={{ 
                color: shard.state === 'Active' ? 'success.main' : 'warning.main',
                fontWeight: 'medium'
              }}>
                {shard.state}
              </Typography>
              
              {shard.shard_key && (
                <>
                  <Typography variant="body2" color="text.secondary">Key:</Typography>
                  <Typography variant="body2" fontFamily="monospace">{shard.shard_key}</Typography>
                </>
              )}
              
              <Typography variant="body2" color="text.secondary">From Peer:</Typography>
              <Typography variant="body2">{fromPeerId}</Typography>
              
              <Typography variant="body2" color="text.secondary">To Peer:</Typography>
              <Typography variant="body2">{toPeerId}</Typography>
            </Box>
          </Box>
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
          disabled={loading}
        >
          {loading ? 'Transferring...' : 'Confirm Transfer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

ShardTransferDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  transferRequest: PropTypes.shape({
    shard: PropTypes.shape({
      shard_id: PropTypes.number.isRequired,
      state: PropTypes.string.isRequired,
      shard_key: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }).isRequired,
    fromPeerId: PropTypes.number.isRequired,
    toPeerId: PropTypes.number.isRequired,
  }),
  onConfirm: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  collectionName: PropTypes.string.isRequired,
};

export default ShardTransferDialog;