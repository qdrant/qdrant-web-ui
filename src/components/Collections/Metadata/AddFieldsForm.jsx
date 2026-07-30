import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Button, IconButton, TextField, Tooltip, Typography } from '@mui/material';
import { Plus, Trash2 } from 'lucide-react';

let nextFieldRowId = 1;

/**
 * Create a blank key/value row for the multi-field add form.
 *
 * @return {{id: number, key: string, value: string}} empty row
 */
export const createEmptyFieldRow = () => ({
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
export const isFieldRowEmpty = (row) => !row.key.trim() && !row.value.trim();

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
export const canSubmitFieldRows = (rows) => {
  let hasComplete = false;

  for (const row of rows) {
    if (isFieldRowEmpty(row)) continue;
    if (!isFieldRowComplete(row)) return false;
    hasComplete = true;
  }

  return hasComplete;
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

  // Allow removing any row once another filled pair exists
  const canRemoveRows = rows.some((row, index) => index > 0 && !isFieldRowEmpty(row));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {rows.map((row, index) => (
        <Box key={row.id} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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

export default AddFieldsForm;
