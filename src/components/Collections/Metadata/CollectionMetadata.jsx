import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
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
  Tooltip,
} from '@mui/material';
import { Trash } from 'lucide-react';
import { enqueueSnackbar, closeSnackbar } from 'notistack';
import JsonViewerCustom from '../../Common/JsonViewerCustom';
import { CopyButton } from '../../Common/CopyButton';
import ConfirmationDialog from '../../Common/ConfirmationDialog';
import CollapsibleCard from '../../Common/CollapsibleCard';
import { bigIntJSON } from '../../../common/bigIntJSON';
import { useClient } from '../../../context/client-context';
import { getSnackbarOptions } from '../../Common/utils/snackbarOptions';
import { useJsonViewerTheme } from '../../../theme/json-viewer-theme';
import { COLLECTION_METADATA_CARD_ID } from '../collectionSectionIds';
import { useScrollToId } from '../../../hooks/useScrollToId';
import {
  MetadataRow,
  MetadataKeyName,
  MetadataActionProvider,
  MetadataColorspaceProvider,
  InPlaceAddField,
} from './metadataValueTypes';
import AddFieldsForm, { createEmptyFieldRow, canSubmitFieldRows, isFieldRowEmpty } from './AddFieldsForm';

const hasMetadata = (metadata) => metadata != null && typeof metadata === 'object' && Object.keys(metadata).length > 0;

const emptyMetadata = {};

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

  const { colorspace } = useJsonViewerTheme('info');
  const colorspaceSubset = useMemo(
    () => ({
      base02: colorspace.base02,
      base05: colorspace.comment,
      base08: colorspace.base08,
      base09: colorspace.base09,
      base0B: colorspace.base0B,
      base0D: colorspace.comment,
    }),
    [colorspace]
  );

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
    const originalValue = currentMetadata[editingKey];
    if (typeof originalValue === 'object' && originalValue != null && typeof parsed === 'string') {
      enqueueSnackbar(
        'Invalid JSON — value must be a valid object or array',
        getSnackbarOptions('error', closeSnackbar, 4000)
      );
      return;
    }
    const ok = await updateMetadataField({ [editingKey]: parsed }, `Updated metadata field "${editingKey}"`);
    if (ok) {
      setEditingKey(null);
      setEditValue('');
    }
  }, [editingKey, editValue, currentMetadata, updateMetadataField]);

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

  // Reveal a field's edit/delete actions when its row (primitive) or container
  // (object/array) is hovered, and — while an object/array field is being
  // edited — hide its rendered subtree so the in-place editor replaces it.
  // `.w-rjv-inner.w-rjv` is the root container, excluded so hovering blank space
  // does not reveal every field's actions at once.
  const viewerSx = {
    '& .metadata-actions': {
      opacity: 0,
      pointerEvents: 'none',
      transition: 'opacity 0.12s ease-in-out',
    },
    '& .w-rjv-line:hover .metadata-actions, & .w-rjv-inner:not(.w-rjv):hover .metadata-actions': {
      opacity: 1,
      pointerEvents: 'auto',
    },
    '& .w-rjv-inner[data-metadata-editing="true"] > :not(.metadata-edit-host)': {
      display: 'none',
    },
  };

  return (
    <>
      {showMetadata && (
        <CollapsibleCard
          id={COLLECTION_METADATA_CARD_ID}
          title="Metadata"
          action={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
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
                <Box sx={viewerSx}>
                  <JsonViewerCustom
                    theme="info"
                    value={metadata}
                    displayDataTypes={false}
                    displayObjectSize={false}
                    enableClipboard={false}
                  >
                    <MetadataRow />
                    <MetadataKeyName />
                  </JsonViewerCustom>
                  <InPlaceAddField />
                </Box>
              </MetadataActionProvider>
            </MetadataColorspaceProvider>
          </CardContent>
        </CollapsibleCard>
      )}

      <Dialog open={addDialogOpen} onClose={closeAddForm} fullWidth maxWidth="sm">
        <DialogTitle>Add metadata</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
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
