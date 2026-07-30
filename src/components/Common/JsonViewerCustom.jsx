import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import JsonView from './JsonViewBase';
import { useJsonViewerTheme } from '../../theme/json-viewer-theme';
import { bigIntJSON } from '../../common/bigIntJSON';
import { enqueueSnackbar, closeSnackbar } from 'notistack';
import { getSnackbarOptions } from './utils/snackbarOptions';

const JsonViewerWrapper = ({
  style: styleProp = {},
  theme: themeName = 'qdrant-custom',
  enableClipboard = true,
  collapsed,
  children,
  ...otherProps
}) => {
  const { style: themeStyle } = useJsonViewerTheme(themeName);

  const mergedStyle = useMemo(() => ({ ...themeStyle, ...styleProp }), [themeStyle, styleProp]);

  const handleCopied = useMemo(() => {
    if (!enableClipboard) return undefined;
    return (_text, value) => {
      if (!navigator.clipboard?.writeText) {
        enqueueSnackbar('Clipboard not available (requires HTTPS)', getSnackbarOptions('error', closeSnackbar));
        return;
      }

      // better formatting when the browser still allows it
      const formatted = typeof value === 'string' ? value : bigIntJSON.stringify(value, null, 2);
      navigator.clipboard.writeText(formatted).catch(() => {});
    };
  }, [enableClipboard]);

  return (
    <JsonView
      style={mergedStyle}
      enableClipboard={enableClipboard}
      collapsed={collapsed}
      onCopied={handleCopied}
      {...otherProps}
    >
      {children}
    </JsonView>
  );
};

JsonViewerWrapper.propTypes = {
  style: PropTypes.object,
  theme: PropTypes.string,
  enableClipboard: PropTypes.bool,
  collapsed: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
  children: PropTypes.node,
};

export default JsonViewerWrapper;
