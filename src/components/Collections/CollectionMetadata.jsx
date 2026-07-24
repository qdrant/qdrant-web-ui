import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { Plus, Trash, Trash2 } from 'lucide-react';
import { enqueueSnackbar, closeSnackbar } from 'notistack';
import JsonViewerCustom from '../Common/JsonViewerCustom';
import { CopyButton } from '../Common/CopyButton';
import ConfirmationDialog from '../Common/ConfirmationDialog';
import CollapsibleCard from '../Common/CollapsibleCard';
import { bigIntJSON } from '../../common/bigIntJSON';
import { useClient } from '../../context/client-context';
import { getSnackbarOptions } from '../Common/utils/snackbarOptions';
import { useJsonViewerTheme } from '../../theme/json-viewer-theme';
import { COLLECTION_METADATA_CARD_ID } from './collectionSectionIds';
import { useScrollToId } from '../../hooks/useScrollToId';
import {
  makeMetadataValueTypes,
  metadataKeyRenderer,
  MetadataActionProvider,
  MetadataColorspaceProvider,
  HoverFieldProvider,
  InPlaceAddField,
} from './metadataValueTypes';

const hasMetadata = (metadata) => metadata != null && typeof metadata === 'object' && Object.keys(metadata).length > 0;

const emptyMetadata = {};

let nextFieldRowId = 1;

/**
 * Create a blank key/value row for the multi-field add form.
 *
 * @return {{id: number, key: string, value: string}} empty row
 */
const createEmptyFieldRow = () => ({
  id: nextFieldRowId++,
  key: '',
  value: '',
});

/**
 * Whether a field row has both key and value empty (after trim).
 *
 * @param {{key: string, value: string}} row - field row
 * @return {boolean} true when both inputs are empty
 */
const isFieldRowEmpty = (row) => !row.key.trim() && !row.value.trim();

/**
 * Whether a field row has both key and value filled (after trim).
 *
 * @param {{key: string, value: string}} row - field row
 * @return {boolean} true when both inputs are non-empty
 */
const isFieldRowComplete = (row) => Boolean(row.key.trim() && row.value.trim());

/**
 * Whether the dialog Add button should be enabled for the given rows.
 * Fully empty rows are skipped on submit. Partial rows (only key or only value)
 * block submit. At least one complete row is required.
 *
 * @param {Array<{key: string, value: string}>} rows - field rows
 * @return {boolean} true when the form is ready to submit
 */
const canSubmitFieldRows = (rows) => {
  let hasComplete = false;

  for (const row of rows) {
    if (isFieldRowEmpty(row)) continue;
    if (!isFieldRowComplete(row)) return false;
    hasComplete = true;
  }

  return hasComplete;
};

/**
 * Parse editor input as JSON; fall back to a string literal when parsing fails.
 *
 * @param {string} text - raw input from the field editor
 * @return {*} parsed value
 */
const parseFieldValue = (text) => {
  try {
    return bigIntJSON.parse(text);
  } catch {
    return text;
  }
};

/**
 * Serialize a metadata value for the inline editor input.
 * Always uses JSON representation so strings are quoted, preventing
 * accidental type conversions (e.g. "123" showing as 123).
 *
 * @param {*} value - current field value
 * @return {string} editor text (valid JSON)
 */
const valueToEditorText = (value) => {
  return bigIntJSON.stringify(value, null, 2);
};

/**
 * Multi-row key/value form used by the inline add UI and the empty-metadata dialog.
 *
 * @param {Object} props - component props
 * @param {Array<{id: number, key: string, value: string}>} props.rows - field rows
 * @param {function} props.onChange - called with updated rows array
 * @param {boolean} props.loading - disables inputs while saving
 * @return {JSX.Element} editable key/value rows with an add-row control
 */
const AddFieldsForm = ({ rows, onChange, loading }) => {
  const keyInputRefs = React.useRef({});
  const [focusKeyId, setFocusKeyId] = useState(null);

  useEffect(() => {
    if (focusKeyId == null) return;
    keyInputRefs.current[focusKeyId]?.focus();
    setFocusKeyId(null);
  }, [focusKeyId, rows]);

  const updateRow = (id, patch) => {
    onChange(rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const removeRow = (id) => {
    if (rows.length <= 1) {
      onChange([{ ...rows[0], key: '', value: '' }]);
      return;
    }
    onChange(rows.filter((row) => row.id !== id));
  };

  const addRow = () => {
    const nextRow = createEmptyFieldRow();
    onChange([...rows, nextRow]);
    setFocusKeyId(nextRow.id);
  };

  // Allow removing any row (including the first) once another filled pair exists.
  const canRemoveRows = rows.some((row, index) => index > 0 && !isFieldRowEmpty(row));

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      {rows.map((row, index) => (
        <Box key={row.id} display="flex" flexDirection="column" gap={1}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="caption" color="text.secondary">
              Field {index + 1}
            </Typography>
            {(canRemoveRows || index > 0) && (
              <Tooltip title="Remove field">
                <IconButton
                  aria-label={`Remove field ${index + 1}`}
                  size="small"
                  onClick={() => removeRow(row.id)}
                  disabled={loading}
                >
                  <Trash2 size="0.9rem" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
          <TextField
            fullWidth
            size="small"
            label="Key"
            value={row.key}
            onChange={(e) => updateRow(row.id, { key: e.target.value })}
            disabled={loading}
            autoFocus={index === 0}
            inputRef={(el) => {
              keyInputRefs.current[row.id] = el;
            }}
          />
          <TextField
            fullWidth
            size="small"
            label="Value"
            multiline
            minRows={1}
            maxRows={8}
            value={row.value}
            onChange={(e) => updateRow(row.id, { value: e.target.value })}
            disabled={loading}
            placeholder="JSON or plain string"
          />
        </Box>
      ))}
      <Button
        startIcon={<Plus size="1rem" />}
        onClick={addRow}
        disabled={loading}
        size="small"
        sx={{ alignSelf: 'flex-start' }}
      >
        Add another field
      </Button>
    </Box>
  );
};

AddFieldsForm.propTypes = {
  rows: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      key: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
    })
  ).isRequired,
  onChange: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
};

export const CollectionMetadata = ({
  collectionName,
  metadata,
  onMetadataChange,
  forceAddOpen = false,
  onForceAddClose,
}) => {
  const { client: qdrantClient } = useClient();
  const showMetadata = hasMetadata(metadata);
  const currentMetadata = showMetadata ? metadata : emptyMetadata;

  const viewerContainerRef = useRef(null);
  const [activeField, setActiveField] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [adding, setAdding] = useState(false);
  const [addKey, setAddKey] = useState('');
  const [addValue, setAddValue] = useState('');
  const [fieldRows, setFieldRows] = useState([createEmptyFieldRow()]);
  const [fieldToDelete, setFieldToDelete] = useState(null);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  const [scrollToCardId, setScrollToCardId] = useState(null);

  const isAdding = adding || forceAddOpen;
  // When collection has no metadata yet, add via dialog instead of showing an empty card.
  const addDialogOpen = isAdding && !showMetadata;
  const addInlineOpen = isAdding && showMetadata;

  const clearScrollToCard = useCallback(() => setScrollToCardId(null), []);
  useScrollToId(scrollToCardId, { onScrolled: clearScrollToCard });

  const resetFieldRows = useCallback(() => {
    setFieldRows([createEmptyFieldRow()]);
  }, []);

  useEffect(() => {
    if (forceAddOpen) {
      setEditingKey(null);
      setEditValue('');
      resetFieldRows();
    }
  }, [forceAddOpen, resetFieldRows]);

  const { theme: colorspace } = useJsonViewerTheme('info');
  const colorspaceSubset = useMemo(
    () => ({
      base02: colorspace.base02,
      base08: colorspace.base08,
      base09: colorspace.base09,
      base0B: colorspace.base0B,
      base0D: colorspace.base0D,
      base0E: colorspace.base0E,
      base0F: colorspace.base0F,
    }),
    [colorspace]
  );

  const valueTypes = useMemo(() => makeMetadataValueTypes(), []);

  const handleViewerMouseOver = useCallback((e) => {
    const row = e.target.closest?.('[data-testid^="data-key-pair"]');
    if (!row || (e.relatedTarget instanceof Node && row.contains(e.relatedTarget))) return;
    setActiveField(row.getAttribute('data-testid').slice('data-key-pair'.length));
  }, []);

  const handleViewerMouseLeave = useCallback(() => setActiveField(null), []);

  const closeAddForm = useCallback(() => {
    setAdding(false);
    setAddKey('');
    setAddValue('');
    resetFieldRows();
    onForceAddClose?.();
  }, [onForceAddClose, resetFieldRows]);

  const cancelEdit = useCallback(() => {
    setEditingKey(null);
    setEditValue('');
  }, []);

  const updateMetadataField = useCallback(
    async (patch, successMessage) => {
      setLoading(true);
      try {
        await qdrantClient.updateCollection(collectionName, { metadata: patch });
        enqueueSnackbar(successMessage, getSnackbarOptions('success', closeSnackbar, 2000));
        onMetadataChange?.();
        return true;
      } catch (err) {
        enqueueSnackbar(err?.message || 'Failed to update metadata', getSnackbarOptions('error', closeSnackbar, 6000));
        return false;
      } finally {
        setLoading(false);
      }
    },
    [qdrantClient, collectionName, onMetadataChange]
  );

  const saveEdit = useCallback(async () => {
    if (editingKey == null) return;
    const parsed = parseFieldValue(editValue);
    const ok = await updateMetadataField({ [editingKey]: parsed }, `Updated metadata field "${editingKey}"`);
    if (ok) {
      setEditingKey(null);
      setEditValue('');
    }
  }, [editingKey, editValue, updateMetadataField]);

  const saveInlineAdd = useCallback(async () => {
    const key = addKey.trim();
    if (!key) {
      enqueueSnackbar('Key is required', getSnackbarOptions('error', closeSnackbar, 4000));
      return;
    }
    if (Object.prototype.hasOwnProperty.call(currentMetadata, key)) {
      enqueueSnackbar(`Key "${key}" already exists`, getSnackbarOptions('error', closeSnackbar, 4000));
      return;
    }
    const parsed = parseFieldValue(addValue);
    const ok = await updateMetadataField({ [key]: parsed }, `Added metadata field "${key}"`);
    if (ok) {
      closeAddForm();
    }
  }, [addKey, addValue, currentMetadata, updateMetadataField, closeAddForm]);

  const metadataAction = useMemo(
    () => ({
      editingKey,
      editValue,
      setEditValue,
      saveEdit,
      cancelEdit,
      loading,
      addingInline: addInlineOpen,
      addKey,
      setAddKey,
      addValue,
      setAddValue,
      saveAdd: saveInlineAdd,
      cancelAdd: closeAddForm,
      editField: (key, value) => {
        closeAddForm();
        setEditingKey(key);
        setEditValue(valueToEditorText(value));
      },
      deleteField: (key) => {
        cancelEdit();
        closeAddForm();
        setFieldToDelete(key);
      },
    }),
    [editingKey, editValue, saveEdit, cancelEdit, loading, addInlineOpen, addKey, addValue, saveInlineAdd, closeAddForm]
  );

  const handleConfirmDelete = async () => {
    if (fieldToDelete == null) return;
    const key = fieldToDelete;
    setFieldToDelete(null);
    await updateMetadataField({ [key]: null }, `Deleted metadata field "${key}"`);
  };

  const handleConfirmDeleteAll = async () => {
    const patch = Object.fromEntries(Object.keys(currentMetadata).map((key) => [key, null]));
    setConfirmDeleteAll(false);
    cancelEdit();
    closeAddForm();
    await updateMetadataField(patch, 'Deleted all metadata');
  };

  const handleSaveAdd = async () => {
    if (!canSubmitFieldRows(fieldRows)) {
      enqueueSnackbar('Each field needs both a key and a value', getSnackbarOptions('error', closeSnackbar, 4000));
      return;
    }

    const patch = {};
    const seenKeys = new Set();

    for (const row of fieldRows) {
      if (isFieldRowEmpty(row)) continue;

      const key = row.key.trim();

      if (seenKeys.has(key)) {
        enqueueSnackbar(`Duplicate key "${key}" in the form`, getSnackbarOptions('error', closeSnackbar, 4000));
        return;
      }
      if (Object.prototype.hasOwnProperty.call(currentMetadata, key)) {
        enqueueSnackbar(`Key "${key}" already exists`, getSnackbarOptions('error', closeSnackbar, 4000));
        return;
      }
      seenKeys.add(key);
      patch[key] = parseFieldValue(row.value);
    }

    const count = Object.keys(patch).length;
    // Dialog is only used when the collection has no metadata yet.
    const creatingFirstMetadata = !showMetadata;
    const ok = await updateMetadataField(
      patch,
      count === 1 ? `Added metadata field "${Object.keys(patch)[0]}"` : `Added ${count} metadata fields`
    );
    if (ok) {
      closeAddForm();
      if (creatingFirstMetadata) {
        setScrollToCardId(COLLECTION_METADATA_CARD_ID);
      }
    }
  };

  const openAddForm = () => {
    cancelEdit();
    setAdding(true);
    setAddKey('');
    setAddValue('');
    resetFieldRows();
  };

  // While editing an object/array field, hide its nested rows so the in-place editor replaces them.
  const editingObjectHideSx =
    editingKey != null && currentMetadata[editingKey] != null && typeof currentMetadata[editingKey] === 'object'
      ? {
          [`& [data-testid="data-key-pair${editingKey}"] > :not(.data-key)`]: {
            display: 'none !important',
          },
          [`& [data-testid="data-key-pair${editingKey}"] .data-object-start, & [data-testid="data-key-pair${editingKey}"] .data-object-end`]:
            {
              display: 'none !important',
            },
        }
      : {};

  return (
    <>
      {showMetadata && (
        <CollapsibleCard
          id={COLLECTION_METADATA_CARD_ID}
          title="Metadata"
          action={
            <Box display="flex" alignItems="center" gap={0.5}>
              <Button
                variant="outlined"
                size="small"
                sx={{ py: 0.75, mb: 0.2 }}
                onClick={openAddForm}
                disabled={loading || addInlineOpen}
              >
                Add Field
              </Button>
              <CopyButton text={bigIntJSON.stringify(metadata)} />
              <Tooltip title="Delete all metadata">
                <IconButton
                  aria-label="Delete all metadata"
                  size="small"
                  onClick={() => {
                    cancelEdit();
                    closeAddForm();
                    setConfirmDeleteAll(true);
                  }}
                  disabled={loading}
                  sx={{ color: 'text.primary' }}
                >
                  <Trash size="1.25rem" />
                </IconButton>
              </Tooltip>
            </Box>
          }
        >
          <CardContent>
            <MetadataColorspaceProvider value={colorspaceSubset}>
              <MetadataActionProvider value={metadataAction}>
                <HoverFieldProvider value={activeField}>
                  <Box
                    ref={viewerContainerRef}
                    onMouseOver={handleViewerMouseOver}
                    onMouseLeave={handleViewerMouseLeave}
                    sx={editingObjectHideSx}
                  >
                    <JsonViewerCustom
                      theme="info"
                      value={metadata}
                      displayDataTypes={false}
                      displayObjectSize={false}
                      rootName={false}
                      enableClipboard={false}
                      valueTypes={valueTypes}
                      keyRenderer={metadataKeyRenderer}
                    />
                    <InPlaceAddField containerRef={viewerContainerRef} />
                  </Box>
                </HoverFieldProvider>
              </MetadataActionProvider>
            </MetadataColorspaceProvider>
          </CardContent>
        </CollapsibleCard>
      )}

      <Dialog open={addDialogOpen} onClose={closeAddForm} fullWidth maxWidth="sm">
        <DialogTitle>Add metadata</DialogTitle>
        <DialogContent>
          <Box pt={1}>
            <AddFieldsForm rows={fieldRows} onChange={setFieldRows} loading={loading} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeAddForm} color="inherit" variant="outlined" disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveAdd}
            color="primary"
            variant="contained"
            disabled={loading || !canSubmitFieldRows(fieldRows)}
          >
            {loading ? 'Saving...' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmationDialog
        open={fieldToDelete != null}
        onClose={() => setFieldToDelete(null)}
        title="Delete metadata field"
        content={`Are you sure you want to delete the metadata field "${fieldToDelete}"?`}
        warning="This action cannot be undone."
        actionName="Delete"
        actionHandler={handleConfirmDelete}
      />

      <ConfirmationDialog
        open={confirmDeleteAll}
        onClose={() => setConfirmDeleteAll(false)}
        title="Delete all metadata"
        content="Are you sure you want to delete all metadata for this collection?"
        warning="This action cannot be undone."
        actionName="Delete"
        actionHandler={handleConfirmDeleteAll}
      />
    </>
  );
};

CollectionMetadata.propTypes = {
  collectionName: PropTypes.string.isRequired,
  metadata: PropTypes.object,
  onMetadataChange: PropTypes.func,
  forceAddOpen: PropTypes.bool,
  onForceAddClose: PropTypes.func,
};

export default memo(CollectionMetadata);
