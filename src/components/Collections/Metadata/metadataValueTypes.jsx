import React, { createContext, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Box, InputBase, Tooltip } from '@mui/material';
import { Check, Pencil, Trash2, X } from 'lucide-react';
import PropTypes from 'prop-types';
import JsonView from '../../Common/JsonViewBase';

// ColorspaceContext — compute colors outside the json view tree and pass them in.
const ColorspaceContext = createContext(null);
export const MetadataColorspaceProvider = ColorspaceContext.Provider;

/**
 * MetadataActionContext — provides field actions and in-place edit state:
 * { editField, deleteField, editingKey, editValue, setEditValue, saveEdit, cancelEdit, loading }
 */
const MetadataActionContext = createContext(null);
export const MetadataActionProvider = MetadataActionContext.Provider;

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
 * Renders a top-level metadata key label (`"key":`) using the json view's CSS
 * variables so it matches the surrounding tree while a field is being edited.
 *
 * @param {Object} props - component props
 * @param {string} props.fieldKey - the field name to render
 * @return {JSX.Element} the styled key label
 */
const KeyLabel = ({ fieldKey }) => (
  <Box component="span" sx={{ verticalAlign: 'middle' }}>
    <Box component="span" sx={{ color: 'var(--w-rjv-key-string, currentColor)' }}>
      &quot;{fieldKey}&quot;
    </Box>
    <Box component="span" sx={{ color: 'var(--w-rjv-colon-color, currentColor)' }}>
      :
    </Box>
    &nbsp;
  </Box>
);

KeyLabel.propTypes = {
  fieldKey: PropTypes.string.isRequired,
};

/**
 * In-place value editor rendered inside a json view row.
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

/**
 * Edit/Delete action icons appended to a top-level metadata field.
 * Wrapped in a `.metadata-actions` span so the parent card can reveal them on
 * row hover via CSS. Hidden while the field is being edited.
 *
 * @param {Object} props - component props
 * @param {string} props.fieldKey - the top-level field name
 * @param {*} props.value - the field's current value
 * @return {JSX.Element|null} the action icons, or null when hidden
 */
const MetadataFieldActions = ({ fieldKey, value }) => {
  const colors = useContext(ColorspaceContext) || {};
  const metadataAction = useContext(MetadataActionContext);
  const isEditing = metadataAction?.editingKey === fieldKey;

  if (!metadataAction || isEditing) {
    return null;
  }

  return (
    <Box component="span" className="metadata-actions">
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
    </Box>
  );
};

MetadataFieldActions.propTypes = {
  fieldKey: PropTypes.string.isRequired,
  value: PropTypes.any,
};

const MetadataRowInner = ({ rowProps, value, keys }) => {
  const metadataAction = useContext(MetadataActionContext);
  const path = keys || [];
  const isTopLevelPrimitive = path.length === 1 && isPrimitive(value);
  const { children, ...restProps } = rowProps;

  if (!isTopLevelPrimitive) {
    return <div {...rowProps} />;
  }

  const fieldKey = String(path[0]);
  const isEditing = metadataAction?.editingKey === fieldKey;

  if (isEditing) {
    return (
      <div {...restProps}>
        <KeyLabel fieldKey={fieldKey} />
        <InPlaceEditor multiline={false} />
      </div>
    );
  }

  return (
    <div {...restProps}>
      {children}
      <MetadataFieldActions fieldKey={fieldKey} value={value} />
    </div>
  );
};

MetadataRowInner.propTypes = {
  rowProps: PropTypes.object.isRequired,
  value: PropTypes.any,
  keys: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
};

/**
 * A Row child for @uiw/react-json-view that adds edit/delete actions and
 * in-place editing to top-level primitive metadata fields. Nested rows and
 * object/array fields (handled by {@link MetadataKeyName}) render unchanged.
 *
 * @return {JSX.Element} Row render element
 */
export const MetadataRow = () => {
  const Row = JsonView.Row;
  return <Row render={(props, { value, keys }) => <MetadataRowInner rowProps={props} value={value} keys={keys} />} />;
};

// While editing an object/array field, hide its rendered subtree (via the
// `data-metadata-editing` attribute + CSS in CollectionMetadata) and render the
// multiline editor in a portal appended inside the field's container.
const ObjectFieldEditor = ({ keyProps, fieldKey }) => {
  const anchorRef = useRef(null);
  const [host, setHost] = useState(null);
  const { children, ...restKeyProps } = keyProps;

  useLayoutEffect(() => {
    const inner = anchorRef.current?.closest('.w-rjv-inner');
    if (!inner) {
      return undefined;
    }
    inner.setAttribute('data-metadata-editing', 'true');
    const hostEl = document.createElement('div');
    hostEl.className = 'metadata-edit-host';
    inner.appendChild(hostEl);
    setHost(hostEl);
    return () => {
      inner.removeAttribute('data-metadata-editing');
      hostEl.remove();
    };
  }, []);

  return (
    <>
      <span {...restKeyProps} ref={anchorRef}>
        {children}
      </span>
      {host &&
        createPortal(
          <Box component="span" sx={{ display: 'inline-flex', alignItems: 'flex-start' }}>
            <KeyLabel fieldKey={fieldKey} />
            <InPlaceEditor multiline />
          </Box>,
          host
        )}
    </>
  );
};

ObjectFieldEditor.propTypes = {
  keyProps: PropTypes.object.isRequired,
  fieldKey: PropTypes.string.isRequired,
};

const MetadataKeyNameInner = ({ keyProps, value, keys }) => {
  const metadataAction = useContext(MetadataActionContext);
  const path = keys || [];
  const isTopLevelObject = path.length === 1 && !isPrimitive(value);

  if (!isTopLevelObject) {
    return <span {...keyProps} />;
  }

  const fieldKey = String(path[0]);
  const isEditing = metadataAction?.editingKey === fieldKey;

  if (isEditing) {
    return <ObjectFieldEditor keyProps={keyProps} fieldKey={fieldKey} />;
  }

  const { children, ...restKeyProps } = keyProps;
  return (
    <span {...restKeyProps}>
      {children}
      <MetadataFieldActions fieldKey={fieldKey} value={value} />
    </span>
  );
};

MetadataKeyNameInner.propTypes = {
  keyProps: PropTypes.object.isRequired,
  value: PropTypes.any,
  keys: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
};

/**
 * A KeyName child for @uiw/react-json-view that adds edit/delete actions and
 * in-place editing to top-level object/array metadata fields. Row rendering
 * (via {@link MetadataRow}) covers primitive fields.
 *
 * @return {JSX.Element} KeyName render element
 */
export const MetadataKeyName = () => {
  const KeyName = JsonView.KeyName;
  return (
    <KeyName render={(props, { value, keys }) => <MetadataKeyNameInner keyProps={props} value={value} keys={keys} />} />
  );
};

/**
 * Inline key/value input portaled into the root JSON object's field list,
 * so it appears before the closing brace. Matches InPlaceEditor styling.
 * Enter saves; Escape cancels.
 *
 * @return {JSX.Element|null} marker + portaled form when active
 */
export const InPlaceAddField = () => {
  const colors = useContext(ColorspaceContext) || {};
  const metadataAction = useContext(MetadataActionContext);
  const keyRef = useRef(null);
  const markerRef = useRef(null);
  const [host, setHost] = useState(null);
  const addingInline = Boolean(metadataAction?.addingInline);

  useLayoutEffect(() => {
    if (!addingInline) {
      return undefined;
    }

    const rootViewer = markerRef.current?.parentElement?.querySelector('.w-json-view-container');
    const wrap = rootViewer ? [...rootViewer.children].find((el) => el.classList?.contains('w-rjv-wrap')) : null;
    if (!wrap) {
      return undefined;
    }

    const hostEl = document.createElement('div');
    hostEl.className = 'metadata-add-host';
    wrap.appendChild(hostEl);
    setHost(hostEl);

    return () => {
      hostEl.remove();
    };
  }, [addingInline]);

  useEffect(() => {
    if (addingInline && host) {
      keyRef.current?.focus();
    }
  }, [addingInline, host]);

  useEffect(() => {
    if (!addingInline) {
      setHost(null);
    }
  }, [addingInline]);

  if (!addingInline) {
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

  return (
    <>
      <Box ref={markerRef} component="span" aria-hidden sx={{ display: 'none' }} />
      {host &&
        createPortal(
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              py: 0.5,
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
          host
        )}
    </>
  );
};
