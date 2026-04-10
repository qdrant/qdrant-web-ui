import React, { createContext, useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Tooltip } from '@mui/material';
import { getDescriptionByPath, loadOpenApiSchemas } from './openapi-descriptions';

// Context to pass colorspace from outside the json-viewer tree (where useTheme works)
// into the custom value renderer (where the json-viewer's bundled MUI shadows the project's theme).
const ColorspaceContext = createContext(null);
export const ColorspaceProvider = ColorspaceContext.Provider;

// Context for the OpenAPI schemas object
const SchemasContext = createContext(null);
export const SchemasProvider = SchemasContext.Provider;

/**
 * Hook that loads and returns the OpenAPI schemas object.
 * The fetch is deduped (singleton promise) so multiple mounts share one request.
 *
 * @return {object|null} The components.schemas object, or null while loading
 */
export function useOpenApiSchemas() {
  const [schemas, setSchemas] = useState(null);

  useEffect(() => {
    loadOpenApiSchemas().then(setSchemas);
  }, []);

  return schemas;
}

// --- Value rendering ---

function isPrimitive(value) {
  return value === null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';
}

// DataBox in @textea/json-viewer is: <Box component="div" sx={{ display: 'inline-block', ...sx }} />
// eslint-disable-next-line react/prop-types
const DataBox = (props) => <Box component="div" {...props} sx={{ display: 'inline-block', ...props.sx }} />;

const NativeValueRenderer = ({ value }) => {
  const colors = useContext(ColorspaceContext);
  const [showRest, setShowRest] = useState(false);
  const collapseStringsAfterLength = 50;

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
        <DataBox className="bool-value">{value ? 'true' : 'false'}</DataBox>
      </DataBox>
    );
  }

  if (typeof value === 'string') {
    const displayValue = showRest ? value : value.slice(0, collapseStringsAfterLength);
    const hasRest = value.length > collapseStringsAfterLength;
    return (
      <DataBox
        sx={{
          color: colors.base09,
          overflowWrap: 'anywhere',
          cursor: hasRest ? 'pointer' : 'inherit',
        }}
        onClick={() => hasRest && setShowRest((v) => !v)}
      >
        <DataBox className="string-value">
          &quot;{displayValue}
          {hasRest && !showRest && <DataBox sx={{ padding: 0.5 }}>…</DataBox>}
          &quot;
        </DataBox>
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
    const color = isInt ? colors.base0F : colors.base0B;
    return (
      <DataBox sx={{ color }}>
        <DataBox className={isInt ? 'int-value' : 'float-value'}>{value}</DataBox>
      </DataBox>
    );
  }

  return <DataBox>{String(value)}</DataBox>;
};

NativeValueRenderer.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool, PropTypes.oneOf([null])]),
};

const DescriptionComment = ({ description, commentColor }) => {
  // Strip markdown-style links and backticks for the inline preview
  const clean = description.replace(/\[.*?\]\(.*?\)/g, '').replace(/`/g, '');
  const firstSentence = clean.split(/\.\s/)[0] + (clean.includes('. ') ? '.' : '');
  const truncated = firstSentence.length > 60 ? firstSentence.slice(0, 60) + '…' : firstSentence;
  return (
    <Tooltip title={description} placement="right" arrow>
      <Box
        component="span"
        sx={{
          color: commentColor,
          opacity: 0.4,
          ml: 3,
          cursor: 'help',
        }}
      >
        {'// ' + truncated}
      </Box>
    </Tooltip>
  );
};

DescriptionComment.propTypes = {
  description: PropTypes.string.isRequired,
  commentColor: PropTypes.string.isRequired,
};

const DescriptionValueComponent = ({ value, path }) => {
  const schemas = useContext(SchemasContext);
  const colors = useContext(ColorspaceContext);
  const description = schemas ? getDescriptionByPath(schemas, 'CollectionInfo', path) : null;

  return (
    <>
      <NativeValueRenderer value={value} />
      {description && <DescriptionComment description={description} commentColor={colors.comment} />}
    </>
  );
};

DescriptionValueComponent.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool, PropTypes.oneOf([null])]),
  path: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])).isRequired,
};

/**
 * Build valueTypes that match primitives when OpenAPI schemas are loaded.
 *
 * @param {object|null} openApiSchemas - The loaded schemas object (null disables matching)
 * @return {Array} valueTypes array for @textea/json-viewer
 */
export function makeCollectionInfoValueTypes(openApiSchemas) {
  if (!openApiSchemas) return [];
  return [
    {
      is: (value, path) => {
        if (!isPrimitive(value)) return false;
        return getDescriptionByPath(openApiSchemas, 'CollectionInfo', path) !== null;
      },
      Component: DescriptionValueComponent,
    },
  ];
}
