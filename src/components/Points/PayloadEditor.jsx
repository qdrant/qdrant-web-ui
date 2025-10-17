import React, { memo, useState } from 'react';
import PropTypes from 'prop-types';
import { useClient } from '../../context/client-context';
import { useSnackbar } from 'notistack';
import isEqual from 'lodash/isEqual';
import { Button, Dialog, DialogActions, DialogTitle, DialogContent } from '@mui/material';
import EditorCommon from '../EditorCommon';
import { getSnackbarOptions } from '../Common/utils/snackbarOptions';
import { bigIntJSON } from '../../common/bigIntJSON';
import ReactDiffViewer from 'react-diff-viewer-continued';
import { useTheme } from '@mui/material/styles';
import { useParams } from 'react-router-dom';

export const PayloadEditor = memo(({ point, open, onClose, onSave, setLoading }) => {
  const qdrantClient = useClient().client;
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const errorSnackbarOptions = getSnackbarOptions('error', closeSnackbar, 6000);
  const successSnackbarOptions = getSnackbarOptions('success', closeSnackbar, 2000);
  const [payload, setPayload] = useState(() => bigIntJSON.stringify(point.payload, null, 2));
  const [showDiff, setShowDiff] = useState(false);
  const theme = useTheme();
  const { collectionName } = useParams();

  const savePayload = async (collectionName, options) => {
    if (Object.keys(point.payload).length !== 0) {
      return qdrantClient.overwritePayload(collectionName, options);
    } else {
      return qdrantClient.setPayload(collectionName, options);
    }
  };
  const handleChange = (value) => {
    setPayload(value);
  };

  const handleSave = () => {
    let payloadToSave;
    try {
      payloadToSave = bigIntJSON.parse(payload);
    } catch (e) {
      enqueueSnackbar(e.message, errorSnackbarOptions);
      return;
    }

    // do nothing if payload is not changed
    if (isEqual(point.payload, payloadToSave)) {
      onClose();
      return;
    }

    setShowDiff(true);
  };

  const handleConfirmSave = () => {
    let payloadToSave;
    try {
      payloadToSave = bigIntJSON.parse(payload);
    } catch (e) {
      enqueueSnackbar(e.message, errorSnackbarOptions);
      return;
    }

    // do nothing if payload is not changed
    if (isEqual(point.payload, payloadToSave)) {
      onClose();
      return;
    }

    setLoading(true);
    const oldPayload = structuredClone(point.payload);

    savePayload(collectionName, {
      payload: payloadToSave,
      points: [point.id],
      wait: true,
    })
      .then((res) => {
        // update payload in the point view
        if (onSave && res.status === 'completed') {
          onSave(payloadToSave);

          enqueueSnackbar('Payload saved', successSnackbarOptions);
        }
      })
      .catch((err) => {
        // rollback payload and show error
        onSave && onSave(oldPayload);
        enqueueSnackbar(err.message, errorSnackbarOptions);
      })
      .finally(() => {
        // stop loading state and show success message
        setLoading(false);
        setShowDiff(false);
      });

    onClose();
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <>Edit payload for point {point.id}</>
        </DialogTitle>
        <DialogContent sx={{ pb: 1 }}>
          <EditorCommon
            height="360px"
            language="json"
            value={bigIntJSON.stringify(point.payload, null, 2)}
            onChange={handleChange}
            options={{
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
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={onClose} color="inherit" variant="outlined" sx={{ mr: 1 }}>
            Cancel
          </Button>
          <Button onClick={handleSave} color="primary" variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showDiff} onClose={() => setShowDiff(false)} fullWidth maxWidth="lg">
        <DialogTitle>
          <>Confirm to save payload changes</>
        </DialogTitle>
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
    background: `${theme.palette.nativeScrollbarBg}`,
    borderRadius: '2px',
  },
          }}
        >
          <ReactDiffViewer
            oldValue={bigIntJSON.stringify(point.payload, null, 2)}
            newValue={payload}
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
          <Button onClick={() => setShowDiff(false)} color="inherit" variant="outlined" sx={{ mr: 1 }}>
            Cancel
          </Button>
          <Button onClick={handleConfirmSave} color="primary" variant="contained">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
});

PayloadEditor.propTypes = {
  point: PropTypes.object.isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func,
  setLoading: PropTypes.func.isRequired,
};

PayloadEditor.displayName = 'PayloadEditor';6
