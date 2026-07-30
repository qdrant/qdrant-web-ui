import React, { createContext, useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Tooltip } from '@mui/material';
import JsonView from '../Common/JsonViewBase';
import { getDescriptionByPath, loadOpenApiSchemas } from './openapi-descriptions';

const ColorspaceContext = createContext(null);
export const ColorspaceProvider = ColorspaceContext.Provider;

const SchemasContext = createContext(null);
export const SchemasProvider = SchemasContext.Provider;

import { buildPathMap } from '../../lib/build-path-map';

export { buildPathMap };

const PathMapContext = createContext(null);
export const PathMapProvider = PathMapContext.Provider;

/**
 * Hook that loads and returns the OpenAPI schemas object.
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

function isPrimitive(value) {
  return value === null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';
}

const DescriptionComment = ({ description, commentColor }) => {
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

/**
 * A Row child component for @uiw/react-json-view that appends OpenAPI
 * description comments to primitive value rows in the collection info tree.
 *
 * @return {JSX.Element} Row render element
 */
export const DescriptionRow = () => {
  const Row = JsonView.Row;
  return (
    <Row
      render={(props, { keyName, value, parentValue }) => {
        return <DescriptionRowInner rowProps={props} keyName={keyName} value={value} parentValue={parentValue} />;
      }}
    />
  );
};

const DescriptionRowInner = ({ rowProps, keyName, value, parentValue }) => {
  const schemas = useContext(SchemasContext);
  const colors = useContext(ColorspaceContext);
  const pathMap = useContext(PathMapContext);
  const { children, ...restProps } = rowProps;

  if (!isPrimitive(value) || !schemas) {
    return <div {...rowProps} />;
  }

  const parentPath = parentValue != null && typeof parentValue === 'object' ? pathMap?.get(parentValue) || [] : [];
  const path = keyName != null ? [...parentPath, keyName] : parentPath;
  const description = getDescriptionByPath(schemas, 'CollectionInfo', path);

  if (!description) {
    return <div {...rowProps} />;
  }

  return (
    <div {...restProps}>
      {children}
      <DescriptionComment description={description} commentColor={colors?.comment || 'inherit'} />
    </div>
  );
};

DescriptionRowInner.propTypes = {
  rowProps: PropTypes.object.isRequired,
  keyName: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  value: PropTypes.any,
  parentValue: PropTypes.any,
};
