import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import JsonView from './JsonViewBase';
import { useJsonViewerTheme } from '../../theme/json-viewer-theme';
import { bigIntJSON } from '../../common/bigIntJSON';

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

  const handleBeforeCopy = useCallback((_copyText, _keyName, value) => {
    return typeof value === 'string' ? value : bigIntJSON.stringify(value, null, 2);
  }, []);

  return (
    <JsonView
      style={mergedStyle}
      enableClipboard={enableClipboard}
      collapsed={collapsed}
      beforeCopy={handleBeforeCopy}
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
