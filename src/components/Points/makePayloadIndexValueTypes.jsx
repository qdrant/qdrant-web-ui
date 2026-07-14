import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Box, Tooltip } from '@mui/material';
import { Database, DatabaseZap } from 'lucide-react';
import PropTypes from 'prop-types';
import { pathToIndexName, isArrayIndexSegment } from '../../lib/payload-index-helpers';

// ColorspaceContext — compute colors outside json-viewer's ThemeProvider and pass them in.
// (The json-viewer bundles its own MUI v5, so useTheme() inside valueTypes Components
// returns json-viewer's internal theme, not the app's theme.)
const ColorspaceContext = createContext(null);
export const PayloadIndexColorspaceProvider = ColorspaceContext.Provider;

// IndexActionContext — provides { open(fieldName), isIndexed(fieldName) } to valueTypes Components.
const IndexActionContext = createContext(null);
export const IndexActionProvider = IndexActionContext.Provider;

// HoverFieldContext — the currently hovered payload field name (dot-joined path),
// set by PointPayload via mouseover on a wrapper div and cleared on mouseleave.
const HoverFieldContext = createContext(null);
export const HoverFieldProvider = HoverFieldContext.Provider;

// Mirrors json-viewer's DataBox
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

// The index button (or "already indexed" indicator) shown while its row is hovered.
// Mirrors json-viewer's IconBox (the copy button wrapper): an inline span with the
// same padding and icon size, so both icons line up.
const PayloadIndexButton = ({ path, sampleValue }) => {
  const colors = useContext(ColorspaceContext) || {};
  const indexAction = useContext(IndexActionContext);
  const activeField = useContext(HoverFieldContext);

  // Row identity for hover tracking keeps the raw path ("items.0.sku"),
  // while the index acts on the Qdrant field name ("items[].sku").
  const rowKey = path.join('.');
  const fieldName = pathToIndexName(path);
  const indexedType = indexAction?.getIndexType(fieldName);

  // Like json-viewer's own copy button, a row counts as hovered while the
  // cursor is on it or on any of its descendants (relevant for array rows).
  const isRowActive = activeField === rowKey || (activeField !== null && activeField.startsWith(`${rowKey}.`));

  if (!indexAction || !isRowActive) {
    return null;
  }

  return indexedType ? (
    <Tooltip title={`Indexed: ${indexedType} — click to edit or delete the index`} placement="top">
      <Box
        component="span"
        role="button"
        aria-label={`Edit index for ${fieldName} (${indexedType})`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          indexAction.open(fieldName, sampleValue);
        }}
        sx={{
          cursor: 'pointer',
          paddingLeft: '0.7rem',
          color: colors.base0D || 'inherit',
        }}
      >
        <DatabaseZap size="0.8rem" />
      </Box>
    </Tooltip>
  ) : (
    <Box
      component="span"
      role="button"
      aria-label={`Create index for ${fieldName}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        indexAction.open(fieldName, sampleValue);
      }}
      sx={{
        cursor: 'pointer',
        paddingLeft: '0.7rem',
        color: colors.base0D || 'inherit',
      }}
    >
      <Database size="0.8rem" />
    </Box>
  );
};

PayloadIndexButton.propTypes = {
  path: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])).isRequired,
  sampleValue: PropTypes.any,
};

const PayloadIndexComponent = ({ value, path }) => (
  <>
    <NativeValueRenderer value={value} />
    <PayloadIndexButton path={path} sampleValue={value} />
  </>
);

PayloadIndexComponent.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool, PropTypes.oneOf([null])]),
  path: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])).isRequired,
};

function isPrimitive(value) {
  return value === null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';
}

/**
 * Returns a valueTypes array for @textea/json-viewer that adds a hover "create index"
 * button to primitive leaf fields in point payload, including fields inside arrays
 * of objects (indexed via the "items[].sku" notation). Elements of primitive arrays
 * are skipped — the index button for those sits on the array row itself (see
 * payloadIndexKeyRenderer). Already indexed fields get an indicator with the index
 * type instead.
 *
 * @return {Array} valueTypes
 */
export function makePayloadIndexValueTypes() {
  return [
    {
      is: (value, path) => isPrimitive(value) && path.length > 0 && !isArrayIndexSegment(path[path.length - 1]),
      Component: PayloadIndexComponent,
    },
  ];
}

// Renders the key of an array-of-primitives row ("sections": […]) with the index
// button attached, since the index for such arrays targets the array field itself
// and the elements' value renderers are skipped. Objects inside arrays keep their
// per-field buttons instead.
//
// The key renderer output is placed at the start of the ".data-key" span, before
// the colon, while json-viewer renders the opening bracket and its hover copy icon
// later in the same span. To match plain fields (index icon first, copy icon after),
// the button is portaled into a dedicated span inserted right after the bracket —
// appending to the span itself would race with the copy icon's mount order.
const PayloadIndexKeyRenderer = ({ path, value }) => {
  const anchorRef = useRef(null);
  const [buttonHost, setButtonHost] = useState(null);

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
      {buttonHost && createPortal(<PayloadIndexButton path={path} sampleValue={value.find(isPrimitive)} />, buttonHost)}
    </>
  );
};

PayloadIndexKeyRenderer.when = ({ value, path }) =>
  Array.isArray(value) && path.length > 0 && !isArrayIndexSegment(path[path.length - 1]) && value.some(isPrimitive);

PayloadIndexKeyRenderer.propTypes = {
  path: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])).isRequired,
  value: PropTypes.array.isRequired,
};

export const payloadIndexKeyRenderer = PayloadIndexKeyRenderer;
