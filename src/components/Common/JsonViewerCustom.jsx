import React from 'react';
import PropTypes from 'prop-types';
import { JsonViewer } from '@textea/json-viewer';
import { useJsonViewerTheme } from '../../theme/json-viewer-theme';

/**
 * Wrapper component for JsonViewer that automatically applies theme overrides
 * and allows additional sx styles to be passed through
 *
 * @param {Object} props - Component props
 * @param {any} props.value - The JSON value to display
 * @param {Object} props.sx - Additional sx styles to merge with theme overrides
 * @param {Object} props.jsonViewerProps - Additional props to pass to JsonViewer
 * @param {string} props.theme - JsonViewer theme name (default: 'qdrant-custom')
 * @return {JSX.Element} Themed JsonViewer component with overrides
 */
const JsonViewerWrapper = ({ sx = {}, jsonViewerProps = {}, theme: themeName = 'qdrant-custom', ...otherProps }) => {
  const { theme, overrides } = useJsonViewerTheme(themeName);

  return (
    <JsonViewer
      theme={theme}
      {...jsonViewerProps}
      sx={{
        ...overrides,
        ...sx,
      }}
      {...otherProps}
    />
  );
};

JsonViewerWrapper.propTypes = {
  sx: PropTypes.object,
  jsonViewerProps: PropTypes.object,
  theme: PropTypes.string,
};

export default JsonViewerWrapper;
