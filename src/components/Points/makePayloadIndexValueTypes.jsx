import React, { createContext, useContext } from 'react';
import { Box } from '@mui/material';
import { Database } from 'lucide-react';
import PropTypes from 'prop-types';

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
const DataBox = ({ sx, ...props }) => (
  <Box component="span" {...props} sx={{ display: 'inline', ...sx }} />
);
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
    return (
      <DataBox sx={{ color: colors.base0E }}>
        {value ? 'true' : 'false'}
      </DataBox>
    );
  }

  if (typeof value === 'string') {
    return (
      <DataBox sx={{ color: colors.base09, overflowWrap: 'anywhere' }}>
        &quot;{value}&quot;
      </DataBox>
    );
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
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.bool,
    PropTypes.oneOf([null]),
  ]),
};

const PayloadIndexComponent = ({ value, path }) => {
  const colors = useContext(ColorspaceContext) || {};
  const indexAction = useContext(IndexActionContext);
  const activeField = useContext(HoverFieldContext);

  const fieldName = path.join('.');
  const alreadyIndexed = indexAction?.isIndexed(fieldName);
  const isRowActive = activeField === fieldName;

  return (
    <>
      <NativeValueRenderer value={value} />
      {indexAction && !alreadyIndexed && isRowActive && (
        // Mirrors json-viewer's IconBox (the copy button wrapper): an inline span on the
        // text baseline with the same padding and icon size, so both icons line up.
        <Box
          component="span"
          role="button"
          aria-label={`Create index for ${fieldName}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            indexAction.open(fieldName, value);
          }}
          sx={{
            cursor: 'pointer',
            paddingLeft: '0.7rem',
            color: colors.base0D || 'inherit',
          }}
        >
          <Database size="0.8rem" />
        </Box>
      )}
    </>
  );
};

PayloadIndexComponent.propTypes = {
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.bool,
    PropTypes.oneOf([null]),
  ]),
  path: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])).isRequired,
};

function isPrimitive(value) {
  return value === null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';
}

function hasNumericSegment(path) {
  return path.some((segment) => typeof segment === 'number' || (typeof segment === 'string' && /^\d+$/.test(segment)));
}

/**
 * Returns a valueTypes array for @textea/json-viewer that adds a hover "create index"
 * button to every primitive leaf field in point payload.
 *
 * @return {Array} valueTypes
 */
export function makePayloadIndexValueTypes() {
  return [
    {
      is: (value, path) => {
        if (!isPrimitive(value)) return false;
        if (path.length === 0) return false;
        if (hasNumericSegment(path)) return false;
        return true;
      },
      Component: PayloadIndexComponent,
    },
  ];
}
