import React, { useMemo, useSyncExternalStore } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import JsonViewerCustom from '../Common/JsonViewerCustom';
import { CopyButton } from '../Common/CopyButton';
import { extractJsonFromMessage } from '../../lib/extract-json-from-message';
import { getErrorDetails, hideErrorDetails, subscribeToErrorDetails } from './error-details-store';

export const ErrorDetailsDialog = () => {
  const message = useSyncExternalStore(subscribeToErrorDetails, getErrorDetails);
  const extracted = useMemo(() => extractJsonFromMessage(message), [message]);

  return (
    <Dialog open={Boolean(message)} onClose={hideErrorDetails} fullWidth maxWidth="md">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 2 }}>
        Error details
        {message && <CopyButton text={message} tooltip="Copy error" />}
      </DialogTitle>
      <DialogContent dividers>
        {extracted ? (
          <>
            {extracted.prefix && (
              <Typography variant="body1" sx={{ mb: 2, wordBreak: 'break-word' }}>
                {extracted.prefix}
              </Typography>
            )}
            <Box sx={{ maxHeight: '60vh', overflow: 'auto' }}>
              <JsonViewerCustom value={extracted.json} displayDataTypes={false} shortenTextAfterLength={0} />
            </Box>
            {extracted.suffix && (
              <Typography variant="body1" sx={{ mt: 2, wordBreak: 'break-word' }}>
                {extracted.suffix}
              </Typography>
            )}
          </>
        ) : (
          <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
            {message}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" color="inherit" onClick={hideErrorDetails}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ErrorDetailsDialog;
