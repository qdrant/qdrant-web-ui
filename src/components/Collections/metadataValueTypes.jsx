import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Box, InputBase, Tooltip } from '@mui/material';
import { Check, Pencil, Trash2, X } from 'lucide-react';
import PropTypes from 'prop-types';

// ColorspaceContext — compute colors outside json-viewer's ThemeProvider and pass them in.
const ColorspaceContext = createContext(null);
export const MetadataColorspaceProvider = ColorspaceContext.Provider;

/**
 * MetadataActionContext — provides field actions and in-place edit state:
 * { editField, deleteField, editingKey, editValue, setEditValue, saveEdit, cancelEdit, loading }
 */
const MetadataActionContext = createContext(null);
export const MetadataActionProvider = MetadataActionContext.Provider;

// HoverFieldContext — the currently hovered top-level field name (dot-joined path).
const HoverFieldContext = createContext(null);
export const HoverFieldProvider = HoverFieldContext.Provider;

const DataBox = ({ sx, ...props }) => <Box component="span" {...props} sx={{ display: 'inline', ...sx }} />;
DataBox.propTypes = { sx: PropTypes.object };

const NativeValueRenderer = ({ value }) => {
  const colors = useContext(ColorspaceContext) || {};

  if (value === null) {
    return (
      <DataBox
        sx={{
          color: colors.base08,
          fontSize: '0.8rem',
          backgroundColor: colors.base02,
          fontWeight: 'bold',
          borderRadius: '3px',
          padding: '0.5px 2px',
        }}
      >
        NULL
      </DataBox>
    );
  }

  if (typeof value === 'boolean') {
    return <DataBox sx={{ color: colors.base0E }}>{value ? 'true' : 'false'}</DataBox>;
  }

  if (typeof value === 'string') {
    return <DataBox sx={{ color: colors.base09, overflowWrap: 'anywhere' }}>&quot;{value}&quot;</DataBox>;
  }

  if (typeof value === 'number') {
    if (isNaN(value)) {
      return (
        <DataBox
          sx={{
            color: colors.base08,
            backgroundColor: colors.base02,
            fontSize: '0.8rem',
            fontWeight: 'bold',
            borderRadius: '3px',
          }}
        >
          NaN
        </DataBox>
      );
    }
    const isInt = value % 1 === 0;
    return <DataBox sx={{ color: isInt ? colors.base0F : colors.base0B }}>{value}</DataBox>;
  }

  return <DataBox>{String(value)}</DataBox>;
};

NativeValueRenderer.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool, PropTypes.oneOf([null])]),
};

function isPrimitive(value) {
  return value === null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';
}

const iconSx = {
  cursor: 'pointer',
  paddingLeft: '0.7rem',
  display: 'inline-flex',
  alignItems: 'center',
  verticalAlign: 'middle',
};

/**
 * In-place value editor rendered inside the json-viewer row.
 * Enter (or Ctrl/Cmd+Enter when multiline) saves; Escape cancels.
 *
 * @param {Object} props - component props
 * @param {boolean} [props.multiline=false] - whether the editor allows multiple lines
 * @return {JSX.Element|null} the in-place editor, or null when actions context is missing
 */
const InPlaceEditor = ({ multiline = false }) => {
  const colors = useContext(ColorspaceContext) || {};
  const metadataAction = useContext(MetadataActionContext);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  if (!metadataAction) {
    return null;
  }

  const { editValue, setEditValue, saveEdit, cancelEdit, loading } = metadataAction;

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      cancelEdit();
      return;
    }
    if (e.key === 'Enter') {
      if (multiline && !(e.metaKey || e.ctrlKey)) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      saveEdit();
    }
  };

  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: multiline ? 'flex-start' : 'center',
        gap: 0.5,
        verticalAlign: 'middle',
        maxWidth: '100%',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <InputBase
        inputRef={inputRef}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={loading}
        multiline={multiline}
        minRows={multiline ? 2 : 1}
        maxRows={12}
        placeholder={multiline ? 'JSON (Ctrl/Cmd+Enter to save)' : 'JSON (Enter to save)'}
        sx={{
          fontFamily: 'monospace',
          fontSize: '0.85rem',
          lineHeight: 1.25,
          color: colors.base09 || 'inherit',
          backgroundColor: colors.base02 || 'transparent',
          borderRadius: 1,
          px: 0.75,
          py: 0,
          minWidth: multiline ? 220 : 120,
          maxWidth: 480,
          border: '1px solid',
          borderColor: colors.base0D || 'currentColor',
          '& .MuiInputBase-input': {
            py: 0.25,
            px: 0,
          },
        }}
      />
      <Tooltip title={multiline ? 'Save (Ctrl/Cmd+Enter)' : 'Save (Enter)'} placement="top">
        <Box
          component="span"
          role="button"
          aria-label="Save field"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!loading) saveEdit();
          }}
          sx={{ ...iconSx, color: colors.base0B || 'inherit', opacity: loading ? 0.5 : 1 }}
        >
          <Check size="0.85rem" />
        </Box>
      </Tooltip>
      <Tooltip title="Cancel (Esc)" placement="top">
        <Box
          component="span"
          role="button"
          aria-label="Cancel edit"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!loading) cancelEdit();
          }}
          sx={{ ...iconSx, color: colors.base08 || 'inherit', opacity: loading ? 0.5 : 1 }}
        >
          <X size="0.85rem" />
        </Box>
      </Tooltip>
    </Box>
  );
};

InPlaceEditor.propTypes = {
  multiline: PropTypes.bool,
};

const MetadataFieldActions = ({ path, value }) => {
  const colors = useContext(ColorspaceContext) || {};
  const metadataAction = useContext(MetadataActionContext);
  const activeField = useContext(HoverFieldContext);

  const fieldKey = String(path[0]);
  const rowKey = path.join('.');
  const isRowActive = activeField === rowKey || (activeField !== null && activeField.startsWith(`${rowKey}.`));
  const isEditing = metadataAction?.editingKey === fieldKey;

  if (!metadataAction || isEditing || !isRowActive) {
    return null;
  }

  return (
    <>
      <Tooltip title="Edit field" placement="top">
        <Box
          component="span"
          role="button"
          aria-label={`Edit metadata field ${fieldKey}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            metadataAction.editField(fieldKey, value);
          }}
          sx={{ ...iconSx, color: colors.base0D || 'inherit' }}
        >
          <Pencil size="0.8rem" />
        </Box>
      </Tooltip>
      <Tooltip title="Delete field" placement="top">
        <Box
          component="span"
          role="button"
          aria-label={`Delete metadata field ${fieldKey}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            metadataAction.deleteField(fieldKey);
          }}
          sx={{ ...iconSx, color: colors.base08 || 'inherit' }}
        >
          <Trash2 size="0.8rem" />
        </Box>
      </Tooltip>
    </>
  );
};

MetadataFieldActions.propTypes = {
  path: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])).isRequired,
  value: PropTypes.any,
};

const MetadataFieldComponent = ({ value, path }) => {
  const metadataAction = useContext(MetadataActionContext);
  const fieldKey = String(path[0]);
  const isEditing = metadataAction?.editingKey === fieldKey;

  if (isEditing) {
    return <InPlaceEditor multiline={false} />;
  }

  return (
    <>
      <NativeValueRenderer value={value} />
      <MetadataFieldActions path={path} value={value} />
    </>
  );
};

MetadataFieldComponent.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool, PropTypes.oneOf([null])]),
  path: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])).isRequired,
};

/**
 * Returns a valueTypes array for @textea/json-viewer that adds edit/delete
 * buttons and in-place editing to top-level primitive metadata fields.
 *
 * @return {Array} valueTypes
 */
export function makeMetadataValueTypes() {
  return [
    {
      is: (value, path) => isPrimitive(value) && path.length === 1,
      Component: MetadataFieldComponent,
    },
  ];
}

// Attaches edit/delete icons (and in-place editor) to top-level object/array rows.
const MetadataKeyRenderer = ({ path, value }) => {
  const anchorRef = useRef(null);
  const [buttonHost, setButtonHost] = useState(null);
  const metadataAction = useContext(MetadataActionContext);
  const fieldKey = String(path[0]);
  const isEditing = metadataAction?.editingKey === fieldKey;

  useEffect(() => {
    const keySpan = anchorRef.current?.closest('.data-key');
    if (!keySpan) return undefined;
    const bracket = keySpan.querySelector(':scope > .data-object-start');
    const host = document.createElement('span');
    keySpan.insertBefore(host, bracket ? bracket.nextSibling : null);
    setButtonHost(host);
    return () => host.remove();
  }, []);

  return (
    <>
      &quot;{path[path.length - 1]}&quot;
      <span ref={anchorRef} style={{ display: 'none' }} />
      {buttonHost &&
        createPortal(
          isEditing ? <InPlaceEditor multiline /> : <MetadataFieldActions path={path} value={value} />,
          buttonHost
        )}
    </>
  );
};

MetadataKeyRenderer.when = ({ value, path }) => path.length === 1 && !isPrimitive(value);

MetadataKeyRenderer.propTypes = {
  path: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])).isRequired,
  value: PropTypes.any,
};

export const metadataKeyRenderer = MetadataKeyRenderer;

/**
 * Inline key/value input portaled inside the JSON viewer, before the closing bracket.
 * Matches InPlaceEditor styling. Enter saves; Escape cancels.
 *
 * @param {Object} props - component props
 * @param {Object} props.containerRef - ref to the Box wrapping JsonViewerCustom
 * @return {JSX.Element|null} the add-field inline form (portaled into the viewer)
 */
export const InPlaceAddField = ({ containerRef }) => {
  const colors = useContext(ColorspaceContext) || {};
  const metadataAction = useContext(MetadataActionContext);
  const keyRef = useRef(null);
  const [hostEl, setHostEl] = useState(null);

  useEffect(() => {
    if (!metadataAction?.addingInline || !containerRef?.current) {
      setHostEl(null);
      return undefined;
    }
    const viewer = containerRef.current;
    // Root structure: Paper > .data-key-pair > (.data-key, .data-object, .data-object-end).
    // Nested objects also use .data-object-end, so only take the root pair's direct child "}".
    const rootPair =
      viewer.querySelector(':scope > .MuiPaper-root > .data-key-pair') ||
      viewer.querySelector('[data-testid="data-key-pair"]');
    const closingBracket = rootPair?.querySelector(':scope > .data-object-end');
    if (!closingBracket) {
      setHostEl(null);
      return undefined;
    }
    const host = document.createElement('div');
    closingBracket.parentNode.insertBefore(host, closingBracket);
    setHostEl(host);
    return () => host.remove();
  }, [metadataAction?.addingInline, containerRef]);

  useEffect(() => {
    if (hostEl && metadataAction?.addingInline) {
      keyRef.current?.focus();
    }
  }, [hostEl, metadataAction?.addingInline]);

  if (!metadataAction?.addingInline || !hostEl) {
    return null;
  }

  const { addKey, setAddKey, addValue, setAddValue, saveAdd, cancelAdd, loading } = metadataAction;

  const inputSx = {
    fontFamily: 'monospace',
    fontSize: '0.85rem',
    lineHeight: 1.25,
    backgroundColor: colors.base02 || 'transparent',
    borderRadius: 1,
    px: 0.75,
    py: 0,
    border: '1px solid',
    borderColor: colors.base0D || 'currentColor',
    '& .MuiInputBase-input': {
      py: 0.25,
      px: 0,
    },
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      cancelAdd();
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      saveAdd();
    }
  };

  return createPortal(
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        pl: 2,
        py: 0.25,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <InputBase
        inputRef={keyRef}
        value={addKey}
        onChange={(e) => setAddKey(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={loading}
        placeholder="key"
        sx={{ ...inputSx, color: colors.base0D || 'inherit', minWidth: 80, maxWidth: 160 }}
      />
      <Box component="span" sx={{ color: colors.base05 || 'text.secondary', mx: 0.25 }}>
        :
      </Box>
      <InputBase
        value={addValue}
        onChange={(e) => setAddValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={loading}
        placeholder="value (Enter to save)"
        sx={{ ...inputSx, color: colors.base09 || 'inherit', minWidth: 120, maxWidth: 480, flex: 1 }}
      />
      <Tooltip title="Save (Enter)" placement="top">
        <Box
          component="span"
          role="button"
          aria-label="Save new field"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!loading) saveAdd();
          }}
          sx={{ ...iconSx, color: colors.base0B || 'inherit', opacity: loading ? 0.5 : 1 }}
        >
          <Check size="0.85rem" />
        </Box>
      </Tooltip>
      <Tooltip title="Cancel (Esc)" placement="top">
        <Box
          component="span"
          role="button"
          aria-label="Cancel add"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!loading) cancelAdd();
          }}
          sx={{ ...iconSx, color: colors.base08 || 'inherit', opacity: loading ? 0.5 : 1 }}
        >
          <X size="0.85rem" />
        </Box>
      </Tooltip>
    </Box>,
    hostEl
  );
};

InPlaceAddField.propTypes = {
  containerRef: PropTypes.shape({ current: PropTypes.any }),
};
