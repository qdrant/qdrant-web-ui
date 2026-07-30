import React, { createContext, useContext } from 'react';
import { Box, Tooltip } from '@mui/material';
import { Database, DatabaseZap } from 'lucide-react';
import PropTypes from 'prop-types';
import JsonView from '../Common/JsonViewBase';
import { pathToIndexName, isArrayIndexSegment } from '../../lib/payload-index-helpers';
import { buildPathMap } from '../../lib/build-path-map';

export { buildPathMap };

const ColorspaceContext = createContext(null);
export const PayloadIndexColorspaceProvider = ColorspaceContext.Provider;

const IndexActionContext = createContext(null);
export const IndexActionProvider = IndexActionContext.Provider;

const HoverFieldContext = createContext(null);
export const HoverFieldProvider = HoverFieldContext.Provider;

const PathMapContext = createContext(null);
export const PathMapProvider = PathMapContext.Provider;

function isPrimitive(value) {
  return value === null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';
}

const PayloadIndexButton = ({ path, sampleValue }) => {
  const colors = useContext(ColorspaceContext) || {};
  const indexAction = useContext(IndexActionContext);
  const activeField = useContext(HoverFieldContext);

  const rowKey = path.join('.');
  const fieldName = pathToIndexName(path);
  const indexedType = indexAction?.getIndexType(fieldName);

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
          display: 'inline-flex',
          alignItems: 'center',
          verticalAlign: 'middle',
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
        display: 'inline-flex',
        alignItems: 'center',
        verticalAlign: 'middle',
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

/**
 * A Row child component for @uiw/react-json-view that appends index action
 * buttons to primitive leaf rows in the point payload JSON tree.
 *
 * @return {JSX.Element} Row render element
 */
export const PayloadIndexRow = () => {
  const Row = JsonView.Row;
  return (
    <Row
      render={(props, { keyName, value, parentValue }) => {
        return <PayloadIndexRowInner rowProps={props} keyName={keyName} value={value} parentValue={parentValue} />;
      }}
    />
  );
};

const PayloadIndexRowInner = ({ rowProps, keyName, value, parentValue }) => {
  const pathMap = useContext(PathMapContext);
  const { children, ...restProps } = rowProps;

  const parentPath = parentValue != null && typeof parentValue === 'object' ? pathMap?.get(parentValue) || [] : [];
  const path = keyName != null ? [...parentPath, keyName] : parentPath;

  const isLeafPrimitive = isPrimitive(value) && path.length > 0 && !isArrayIndexSegment(path[path.length - 1]);

  const isArrayOfPrimitives =
    Array.isArray(value) && path.length > 0 && !isArrayIndexSegment(path[path.length - 1]) && value.some(isPrimitive);

  if (isLeafPrimitive) {
    return (
      <div {...restProps} data-testid={`data-key-pair${path.join('.')}`}>
        {children}
        <PayloadIndexButton path={path} sampleValue={value} />
      </div>
    );
  }

  if (isArrayOfPrimitives) {
    return (
      <div {...restProps} data-testid={`data-key-pair${path.join('.')}`}>
        {children}
        <PayloadIndexButton path={path} sampleValue={value.find(isPrimitive)} />
      </div>
    );
  }

  if (typeof value === 'object' && value !== null && path.length > 0) {
    return (
      <div {...restProps} data-testid={`data-key-pair${path.join('.')}`}>
        {children}
      </div>
    );
  }

  return <div {...rowProps} />;
};

PayloadIndexRowInner.propTypes = {
  rowProps: PropTypes.object.isRequired,
  keyName: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  value: PropTypes.any,
  parentValue: PropTypes.any,
};
