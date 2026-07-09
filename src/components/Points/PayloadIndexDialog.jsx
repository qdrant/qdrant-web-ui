import React, { useEffect, useState } from 'react';
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
  Chip,
  FormControlLabel,
  Checkbox,
  MenuItem,
  Select,
  TextField,
  InputLabel,
  FormControl,
} from '@mui/material';
import { JsonViewer } from '@textea/json-viewer';
import { useTheme } from '@mui/material/styles';
import { useClient } from '../../context/client-context';
import { CopyButton } from '../Common/CopyButton';
import {
  payloadFieldFormToIndexConfig,
  createPayloadIndexParams,
} from '../Collections/CreateCollection/create-collection.js';
import { enqueueSnackbar, closeSnackbar } from 'notistack';
import { getSnackbarOptions } from '../Common/utils/snackbarOptions';

const FIELD_TYPES = ['keyword', 'integer', 'float', 'uuid', 'datetime', 'text', 'geo', 'bool'];

const TEXT_TOKENIZERS = ['prefix', 'whitespace', 'word', 'multilingual'];

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Suggest an index type from a sample payload value. Returns null when
 * the value gives no hint (for example null).
 *
 * @param {*} value - payload field value
 * @return {string|null} one of FIELD_TYPES or null
 */
export function suggestFieldType(value) {
  if (typeof value === 'boolean') return 'bool';
  if (typeof value === 'bigint') return 'integer';
  if (typeof value === 'number') return Number.isInteger(value) ? 'integer' : 'float';
  if (typeof value === 'string') {
    if (UUID_REGEX.test(value)) return 'uuid';
    if (/^\d{4}-\d{2}-\d{2}/.test(value) && !isNaN(Date.parse(value))) return 'datetime';
    return 'keyword';
  }
  return null;
}

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

const PayloadIndexDialog = ({ open, onClose, collectionName, fieldName, fieldValue, payloadSchema, onSuccess }) => {
  const { client: qdrantClient } = useClient();
  const theme = useTheme();
  const [selectedType, setSelectedType] = useState(null);
  const [params, setParams] = useState(DEFAULT_STATE);
  const [loading, setLoading] = useState(false);

  // Preselect the type matching the field value; the user can still change it.
  useEffect(() => {
    if (open) setSelectedType(suggestFieldType(fieldValue));
  }, [open, fieldValue]);

  const isAlreadyIndexed = payloadSchema && fieldName && fieldName in payloadSchema;
  const canSubmit = !isAlreadyIndexed && !!selectedType && !loading;

  const requestParams = selectedType
    ? createPayloadIndexParams(payloadFieldFormToIndexConfig(fieldName, { field_config_enum: selectedType, ...params }))
    : null;

  const handleClose = () => {
    setSelectedType(null);
    setParams(DEFAULT_STATE);
    onClose();
  };

  const set = (key, value) => setParams((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    try {
      // wait: true, so the refreshed collection info already contains the new index
      await qdrantClient.createPayloadIndex(collectionName, { ...requestParams, wait: true });
      enqueueSnackbar(`Index created for "${fieldName}"`, getSnackbarOptions('success', closeSnackbar, 2000));
      handleClose();
      onSuccess?.();
    } catch (err) {
      enqueueSnackbar(err?.message || 'Failed to create index', getSnackbarOptions('error', closeSnackbar));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Create Payload Index</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Indexes speed up filtered search. Pick the type that matches the values of this field.
        </Typography>

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

        {isAlreadyIndexed ? (
          <Alert severity="warning">
            Field &ldquo;{fieldName}&rdquo; is already indexed ({payloadSchema[fieldName]?.data_type}).
          </Alert>
        ) : (
          <>
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
                  <JsonViewer
                    value={requestParams}
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
            )}
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button variant="contained" color="primary" onClick={handleSubmit} disabled={!canSubmit}>
          {loading ? 'Creating...' : 'Create Index'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

PayloadIndexDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  collectionName: PropTypes.string.isRequired,
  fieldName: PropTypes.string,
  fieldValue: PropTypes.any,
  payloadSchema: PropTypes.object,
  onSuccess: PropTypes.func,
};

export default PayloadIndexDialog;
