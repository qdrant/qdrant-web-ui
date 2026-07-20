import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ReactDiffViewer from 'react-diff-viewer-continued';
import { useClient } from '../../context/client-context';
import EditorCommon from '../EditorCommon';
import { bigIntJSON } from '../../common/bigIntJSON';
import { enqueueSnackbar, closeSnackbar } from 'notistack';
import { getSnackbarOptions } from '../Common/utils/snackbarOptions';

const hasMetadata = (metadata) => metadata != null && typeof metadata === 'object' && Object.keys(metadata).length > 0;

const emptyMetadata = {};

/**
 * Apply the same merge rules as the update-collection API:
 * empty object clears metadata; otherwise top-level keys are merged over the current object.
 *
 * @param {Object} current - existing collection metadata
 * @param {Object} patch - metadata object from the editor
 * @return {Object} metadata after the merge
 */
const mergeMetadata = (current, patch) => {
  if (!hasMetadata(patch)) {
    return emptyMetadata;
  }
  return { ...current, ...patch };
};

const editorOptions = {
  scrollBeyondLastLine: false,
  fontSize: 12,
  wordWrap: 'on',
  minimap: { enabled: false },
  automaticLayout: true,
  quickSuggestions: {
    other: false,
    comments: false,
    strings: false,
  },
  parameterHints: {
    enabled: false,
  },
  suggestOnTriggerCharacters: false,
  acceptSuggestionOnEnter: 'off',
  tabCompletion: 'off',
  wordBasedSuggestions: false,
  padding: { top: 16, bottom: 16 },
};

const CollectionMetadataDialog = ({ open, onClose, collectionName, metadata, onSuccess }) => {
  const { client: qdrantClient } = useClient();
  const theme = useTheme();
  const currentMetadata = hasMetadata(metadata) ? metadata : emptyMetadata;
  const [text, setText] = useState(() => bigIntJSON.stringify(currentMetadata, null, 2));
  const [loading, setLoading] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  const [pendingPatch, setPendingPatch] = useState(null);

  const previousMetadataString = bigIntJSON.stringify(currentMetadata, null, 2);
  const mergedResult = pendingPatch !== null ? mergeMetadata(currentMetadata, pendingPatch) : null;
  const mergedResultString = mergedResult !== null ? bigIntJSON.stringify(mergedResult, null, 2) : '';
  const mergeHasNoEffect = mergedResult !== null && isEqual(currentMetadata, mergedResult);

  useEffect(() => {
    if (open) {
      setText(bigIntJSON.stringify(hasMetadata(metadata) ? metadata : emptyMetadata, null, 2));
      setShowDiff(false);
      setPendingPatch(null);
    }
  }, [open, metadata]);

  const handleClose = () => {
    setShowDiff(false);
    setPendingPatch(null);
    onClose();
  };

  const parseMetadata = () => {
    try {
      const value = bigIntJSON.parse(text);
      if (value === null || typeof value !== 'object' || Array.isArray(value)) {
        enqueueSnackbar('Metadata must be a JSON object', getSnackbarOptions('error', closeSnackbar, 6000));
        return null;
      }
      return value;
    } catch (err) {
      enqueueSnackbar(err.message || 'Invalid JSON', getSnackbarOptions('error', closeSnackbar, 6000));
      return null;
    }
  };

  const handleMerge = () => {
    const nextMetadata = parseMetadata();
    if (nextMetadata === null) return;

    // Only skip the confirm dialog when the submitted object is identical to current metadata.
    // If keys were removed in the editor, still show the diff so the no-op merge is visible.
    if (isEqual(currentMetadata, nextMetadata)) {
      handleClose();
      return;
    }

    setPendingPatch(nextMetadata);
    setShowDiff(true);
  };

  const handleConfirmMerge = async () => {
    if (pendingPatch === null) return;

    const merged = mergeMetadata(currentMetadata, pendingPatch);
    if (isEqual(currentMetadata, merged)) {
      enqueueSnackbar(
        'No metadata changes — removed keys are kept on merge',
        getSnackbarOptions('info', closeSnackbar, 4000)
      );
      handleClose();
      return;
    }

    setLoading(true);
    try {
      await qdrantClient.updateCollection(collectionName, { metadata: pendingPatch });
      enqueueSnackbar('Metadata merged', getSnackbarOptions('success', closeSnackbar, 2000));
      handleClose();
      onSuccess?.();
    } catch (err) {
      enqueueSnackbar(err?.message || 'Failed to merge metadata', getSnackbarOptions('error', closeSnackbar, 6000));
    } finally {
      setLoading(false);
      setShowDiff(false);
      setPendingPatch(null);
    }
  };

  return (
    <>
      <Dialog open={open && !showDiff} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between' }}>
          Edit metadata for {collectionName}
        </DialogTitle>
        <DialogContent sx={{ pb: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Provided object will be merged into existing collection metadata.
            To remove a key, set its value to null.
          </Typography>
          <EditorCommon
            height="360px"
            language="json"
            value={text}
            onChange={setText}
            onMount={(editor) => editor.focus()}
            options={editorOptions}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleClose} color="inherit" variant="outlined" sx={{ mr: 1 }} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleMerge} color="primary" variant="contained" disabled={loading}>
            Merge
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showDiff} onClose={() => setShowDiff(false)} fullWidth maxWidth="lg">
        <DialogTitle>Confirm metadata merge</DialogTitle>
        <DialogContent
          sx={{
            scrollbarWidth: 'thin',
            scrollbarColor: `${theme.palette.nativeScrollbarBg} transparent`,
            '& *::-webkit-scrollbar': {
              width: '4px',
              height: '4px',
            },
            '& *::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '& *::-webkit-scrollbar-thumb': {
              background: theme.palette.nativeScrollbarBg,
              borderRadius: '2px',
            },
          }}
        >
          {mergeHasNoEffect && (
            <Alert severity="info" sx={{ mb: 2 }}>
              This merge will not change collection metadata.
              Removed keys are not deleted — set values to null to remove them.
            </Alert>
          )}
          <ReactDiffViewer
            oldValue={previousMetadataString}
            newValue={mergedResultString}
            splitView={true}
            useDarkTheme={theme.palette.mode === 'dark'}
            styles={{
              diffContainer: {
                fontSize: '12px',
              },
              wordDiff: {
                padding: '0px',
                wordBreak: 'normal',
              },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setShowDiff(false)}
            color="inherit"
            variant="outlined"
            sx={{ mr: 1 }}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={handleConfirmMerge} color="primary" variant="contained" disabled={loading}>
            {loading ? 'Merging...' : mergeHasNoEffect ? 'Close' : 'Confirm Merge'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

CollectionMetadataDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  collectionName: PropTypes.string.isRequired,
  metadata: PropTypes.object,
  onSuccess: PropTypes.func,
};

export default CollectionMetadataDialog;
