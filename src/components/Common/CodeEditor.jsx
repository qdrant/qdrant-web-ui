import React from 'react';
import PropTypes from 'prop-types';
import { Highlight, Prism } from 'prism-react-renderer';
import { Box, useTheme } from '@mui/material';
import StyledEditor from './StyledEditor';
import createPrismTheme from '../../theme/prism-theme';

/**
 * Reusable code editor with syntax highlighting
 * @param {string} value - The code content
 * @param {string} language - Programming language for syntax highlighting
 * @param {function} onChange - Callback when content changes
 * @param {boolean} readOnly - Whether the editor is read-only
 * @param {string} height - Custom height for the editor
 * @param {object} options - Additional editor options
 * @return {JSX.Element}
 */
const CodeEditor = ({
  value,
  language = 'javascript',
  onChange,
  readOnly = false,
  height = 'auto',
  options = {},
  sx = {},
  ...props
}) => {
  const theme = useTheme();

  // Custom Prism theme using exact Figma color matches
  const customPrismTheme = createPrismTheme(theme);

  const highlight = (code) => (
    <Highlight code={code} language={language} theme={customPrismTheme} prism={Prism}>
      {({ className, style, tokens, getLineProps, getTokenProps }) => {
        return (
          <pre
            className={className}
            style={{
              wordBreak: 'keep-all',
              whiteSpace: 'pre-wrap',
              ...style,
            }}
            data-testid={'code-editor-pre'}
          >
            {tokens.map((line, i) => {
              const lineProps = getLineProps({ line, key: i });
              const { key: lineKey, ...restLineProps } = lineProps;
              return (
                <div key={lineKey} {...restLineProps}>
                  {line.map((token, key) => {
                    const tokenProps = getTokenProps({ token, key });
                    const { key: tokenKey, ...restTokenProps } = tokenProps;
                    return <span key={tokenKey} {...restTokenProps} />;
                  })}
                </div>
              );
            })}
          </pre>
        );
      }}
    </Highlight>
  );

  return (
    <Box
      sx={{
        background: theme.palette.background.code,
        borderRadius: '0.5rem',
        height: height,
        overflow: 'auto',
        ...sx,
      }}
      data-testid={'code-editor'}
    >
      <Box sx={{ p: 2 }}>
        {readOnly ? (
          highlight(value)
        ) : (
          <StyledEditor
            value={value}
            onValueChange={onChange}
            highlight={highlight}
            data-testid={'code-editor-input'}
            {...options}
            {...props}
          />
        )}
      </Box>
    </Box>
  );
};

CodeEditor.propTypes = {
  value: PropTypes.string.isRequired,
  language: PropTypes.string,
  onChange: PropTypes.func,
  readOnly: PropTypes.bool,
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  options: PropTypes.object,
  sx: PropTypes.object,
};

export default CodeEditor;
