import React from 'react';
import PropTypes from 'prop-types';
import { JsonViewer } from '@textea/json-viewer';
import { useJsonViewerTheme } from '../../theme/json-viewer-theme';
import { bigIntJSON } from '../../common/bigIntJSON';

/**
 * Copy a value the way a user expects to paste it: strings go to the clipboard
 * as their raw text, without the surrounding quotes json-viewer would add.
 * Everything else is copied as JSON.
 *
 * @param {Array} path - path to the copied value (unused)
 * @param {any} value - the copied value
 * @param {function} copy - writes a string to the clipboard
 * @return {Promise<void>} resolves once the value is on the clipboard
 */
const copyValue = (path, value, copy) => copy(typeof value === 'string' ? value : bigIntJSON.stringify(value, null, 2));

/**
 * Wrapper component for JsonViewer that automatically applies theme overrides
 * and allows additional sx styles to be passed through
 *
 * @param {Object} props - Component props
 * @param {any} props.value - The JSON value to display
 * @param {Object} props.sx - Additional sx styles to merge with theme overrides
 * @param {Object} props.jsonViewerProps - Additional props to pass to JsonViewer
 * @param {string} props.theme - JsonViewer theme name (default: 'qdrant-custom')
 * @param {function} props.onCopy - Copy handler (default: raw text for strings, JSON otherwise)
 * @return {JSX.Element} Themed JsonViewer component with overrides
 */
const JsonViewerWrapper = ({
  sx = {},
  jsonViewerProps = {},
  theme: themeName = 'qdrant-custom',
  enableClipboard = true,
  onCopy = copyValue,
  ...otherProps
}) => {
  const { theme, overrides } = useJsonViewerTheme(themeName);

  return (
    <JsonViewer
      theme={theme}
      enableClipboard={enableClipboard}
      onCopy={onCopy}
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
  enableClipboard: PropTypes.bool,
  onCopy: PropTypes.func,
};

export default JsonViewerWrapper;
