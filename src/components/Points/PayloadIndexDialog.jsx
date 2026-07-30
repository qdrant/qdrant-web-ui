import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  Chip,
  FormControlLabel,
  Checkbox,
  MenuItem,
  Select,
  TextField,
  InputLabel,
  FormControl,
} from '@mui/material';
import { darkTheme } from '@uiw/react-json-view/dark';
import { lightTheme } from '@uiw/react-json-view/light';
import JsonView from '../Common/JsonViewBase';
import { useTheme } from '@mui/material/styles';
import { useClient } from '../../context/client-context';
import { CopyButton } from '../Common/CopyButton';
import DeletePayloadIndexDialog from '../Common/DeletePayloadIndexDialog';
import { createPayloadIndexParams } from '../Collections/CreateCollection/create-collection.js';
import { payloadFieldFormToIndexConfig, suggestFieldType } from '../../lib/payload-index-helpers';
import { enqueueSnackbar, closeSnackbar } from 'notistack';
import { getSnackbarOptions } from '../Common/utils/snackbarOptions';

const FIELD_TYPES = ['keyword', 'integer', 'float', 'uuid', 'datetime', 'text', 'geo', 'bool'];

const TEXT_TOKENIZERS = ['prefix', 'whitespace', 'word', 'multilingual'];

const DEFAULT_STATE = {
  // integer
  range: true,
  lookup: true,
  // text
  tokenizer: 'whitespace',
  lowercase: true,
  phrase_matching: true,
  min_token_len: '',
  max_token_len: '',
};

/**
 * Build the dialog params state from an existing index schema entry,
 * so editing starts from the current index settings.
 *
 * @param {Object} indexInfo - payload_schema entry ({ data_type, params })
 * @return {Object} params state for the dialog
 */
function paramsFromSchema(indexInfo) {
  const params = indexInfo?.params || {};
  const state = { ...DEFAULT_STATE };
  if (indexInfo?.data_type === 'integer') {
    state.range = params.range ?? true;
    state.lookup = params.lookup ?? true;
  }
  if (indexInfo?.data_type === 'text') {
    state.tokenizer = params.tokenizer || 'whitespace';
    state.lowercase = params.lowercase ?? true;
    state.phrase_matching = params.phrase_matching ?? true;
    state.min_token_len = params.min_token_len ?? '';
    state.max_token_len = params.max_token_len ?? '';
  }
  return state;
}

const PayloadIndexDialog = ({
  open,
  onClose,
  collectionName,
  fieldName,
  fieldValue,
  availableFields,
  payloadSchema,
  onSuccess,
}) => {
  const { client: qdrantClient } = useClient();
  const theme = useTheme();
  const [selectedField, setSelectedField] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [params, setParams] = useState(DEFAULT_STATE);
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const indexInfo = selectedField ? payloadSchema?.[selectedField] : null;
  const isEditing = !!indexInfo;
  const canSubmit = !!selectedField && !!selectedType && !loading;

  useEffect(() => {
    if (open) setSelectedField(fieldName || null);
  }, [open, fieldName]);

  // Preset type and params: from the existing index when editing,
  // from a sample value when creating. The user can still change them.
  useEffect(() => {
    if (!open) return;
    const info = selectedField ? payloadSchema?.[selectedField] : null;
    if (info) {
      setSelectedType(info.data_type);
      setParams(paramsFromSchema(info));
    } else {
      const sample =
        selectedField && selectedField === fieldName
          ? fieldValue
          : availableFields?.find((field) => field.name === selectedField)?.value;
      setSelectedType(suggestFieldType(sample));
      setParams(DEFAULT_STATE);
    }
  }, [open, selectedField]);

  const requestParams =
    selectedField && selectedType
      ? createPayloadIndexParams(
          payloadFieldFormToIndexConfig(selectedField, { field_config_enum: selectedType, ...params })
        )
      : null;

  const handleClose = () => {
    setSelectedField(null);
    setSelectedType(null);
    setParams(DEFAULT_STATE);
    onClose();
  };

  const set = (key, value) => setParams((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    try {
      // Changing settings of an existing index requires recreating it.
      if (isEditing) {
        await qdrantClient.deletePayloadIndex(collectionName, selectedField, { wait: true });
      }
      // wait: true, so the refreshed collection info already contains the new index
      await qdrantClient.createPayloadIndex(collectionName, { ...requestParams, wait: true });
      enqueueSnackbar(
        `Index ${isEditing ? 'updated' : 'created'} for "${selectedField}"`,
        getSnackbarOptions('success', closeSnackbar, 2000)
      );
      handleClose();
      onSuccess?.();
    } catch (err) {
      enqueueSnackbar(
        err?.message || `Failed to ${isEditing ? 'update' : 'create'} index`,
        getSnackbarOptions('error', closeSnackbar)
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEditing ? 'Edit Payload Index' : 'Create Payload Index'}</DialogTitle>
      <DialogContent
        sx={{
          scrollbarWidth: 'thin',
          scrollbarColor: `${theme.palette.nativeScrollbarBg} transparent`,
          '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
            width: '4px',
            height: '4px',
          },
          '&::-webkit-scrollbar-track, & *::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
            background: theme.palette.nativeScrollbarBg,
            borderRadius: '2px',
          },
        }}
      >
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Indexes speed up filtered search. Pick the type that matches the values of this field.
        </Typography>

        {fieldName ? (
          <Box
            sx={{
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 1,
              px: 1.5,
              py: 1,
              mb: 3,
              backgroundColor: theme.palette.background.paper,
              display: 'flex',
              alignItems: 'baseline',
              gap: 1.5,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Field
            </Typography>
            <Typography variant="body2" fontFamily="monospace" sx={{ overflowWrap: 'anywhere' }}>
              {fieldName}
            </Typography>
          </Box>
        ) : (
          <Autocomplete
            freeSolo
            options={(availableFields || []).map((field) => field.name)}
            value={selectedField || ''}
            onInputChange={(e, value) => setSelectedField(value || null)}
            sx={{ mb: 3 }}
            renderInput={(inputParams) => (
              <TextField {...inputParams} label="Field" size="small" placeholder="Pick or type a field name" />
            )}
          />
        )}

        {isEditing && (
          <Alert severity="info" sx={{ mb: 2 }}>
            This field is already indexed. Saving will rebuild the index with the new settings.
          </Alert>
        )}

        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Field Type
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
          {FIELD_TYPES.map((type) => (
            <Chip
              key={type}
              label={type}
              variant={selectedType === type ? 'filled' : 'outlined'}
              color={selectedType === type ? 'primary' : 'default'}
              onClick={() => setSelectedType(type)}
              clickable
            />
          ))}
        </Box>

        {selectedType === 'integer' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', mb: 3 }}>
            <FormControlLabel
              control={
                <Checkbox checked={params.lookup} onChange={(e) => set('lookup', e.target.checked)} size="small" />
              }
              label={<Typography variant="body2">Allow match filters (lookup)</Typography>}
            />
            <FormControlLabel
              control={
                <Checkbox checked={params.range} onChange={(e) => set('range', e.target.checked)} size="small" />
              }
              label={<Typography variant="body2">Allow range filters</Typography>}
            />
          </Box>
        )}

        {selectedType === 'text' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Tokenizer</InputLabel>
              <Select value={params.tokenizer} label="Tokenizer" onChange={(e) => set('tokenizer', e.target.value)}>
                {TEXT_TOKENIZERS.map((t) => (
                  <MenuItem key={t} value={t}>
                    {t}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={params.lowercase}
                    onChange={(e) => set('lowercase', e.target.checked)}
                    size="small"
                  />
                }
                label={<Typography variant="body2">Lowercase tokens</Typography>}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={params.phrase_matching}
                    onChange={(e) => set('phrase_matching', e.target.checked)}
                    size="small"
                  />
                }
                label={<Typography variant="body2">Phrase matching</Typography>}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Min Token Length"
                type="number"
                size="small"
                fullWidth
                value={params.min_token_len}
                onChange={(e) => set('min_token_len', e.target.value)}
                inputProps={{ min: 1 }}
              />
              <TextField
                label="Max Token Length"
                type="number"
                size="small"
                fullWidth
                value={params.max_token_len}
                onChange={(e) => set('max_token_len', e.target.value)}
                inputProps={{ min: 1 }}
              />
            </Box>
          </Box>
        )}

        {requestParams && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2" fontWeight="bold">
                Request
              </Typography>
              <CopyButton
                text={`PUT collections/${collectionName}/index\n${JSON.stringify(requestParams, null, 2)}`}
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
                  overflowWrap: 'anywhere',
                }}
              >
                PUT collections/{collectionName}/index
              </Typography>
              <JsonView
                value={requestParams}
                style={{
                  ...(theme.palette.mode === 'dark' ? darkTheme : lightTheme),
                  '--w-rjv-background-color': 'transparent',
                  fontSize: '0.875rem',
                }}
                enableClipboard={false}
                displayDataTypes={false}
              />
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        {isEditing && (
          <Button color="error" onClick={() => setConfirmDelete(true)} disabled={loading} sx={{ mr: 'auto' }}>
            Delete Index
          </Button>
        )}
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button variant="contained" color="primary" onClick={handleSubmit} disabled={!canSubmit}>
          {loading ? 'Saving...' : isEditing ? 'Update Index' : 'Create Index'}
        </Button>
      </DialogActions>
      <DeletePayloadIndexDialog
        collectionName={collectionName}
        fieldName={confirmDelete ? selectedField : null}
        onClose={() => setConfirmDelete(false)}
        onSuccess={() => {
          setConfirmDelete(false);
          handleClose();
          onSuccess?.();
        }}
      />
    </Dialog>
  );
};

PayloadIndexDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  collectionName: PropTypes.string.isRequired,
  fieldName: PropTypes.string,
  fieldValue: PropTypes.any,
  availableFields: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      value: PropTypes.any,
    })
  ),
  payloadSchema: PropTypes.object,
  onSuccess: PropTypes.func,
};

export default PayloadIndexDialog;
