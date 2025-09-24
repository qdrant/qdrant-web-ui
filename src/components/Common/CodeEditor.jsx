import React from 'react';
import PropTypes from 'prop-types';
import { Highlight, Prism } from 'prism-react-renderer';
import { Box, useTheme } from '@mui/material';
import { lightGreen, deepOrange, blue } from '../../theme/colors';
import StyledEditor from './StyledEditor';

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
  ...props
}) => {
  const theme = useTheme();

  // Custom Prism theme using exact Figma color matches
  const customPrismTheme = {
    plain: {
      color: theme.palette.text.primary,
      backgroundColor: theme.palette.background.code,
    },
    styles: [
      {
        types: ['comment', 'prolog', 'doctype', 'cdata'],
        style: {
          color: lightGreen[300],
          fontStyle: 'italic',
        },
      },
      {
        types: ['string', 'attr-value'],
        style: {
          color: deepOrange[300],
        },
      },
      {
        types: ['punctuation', 'operator'],
        style: {
          color: theme.palette.text.primary,
        },
      },
      {
        types: ['entity', 'url', 'symbol', 'number', 'boolean', 'variable', 'constant', 'regex', 'inserted'],
        style: {
          color: lightGreen[300],
        },
      },
      {
        types: ['property'],
        style: {
          color: theme.palette.secondary.main,
        },
      },
      {
        types: ['atrule', 'keyword', 'attr-name', 'selector'],
        style: {
          color: blue[500],
        },
      },
      {
        types: ['function', 'deleted', 'tag'],
        style: {
          color: blue[500],
        },
      },
      {
        types: ['function-variable'],
        style: {
          color: lightGreen[300],
        },
      },
    ],
  };

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
        // border: '1px solid',
        // borderColor: theme.palette.divider,
        height: height,
        overflow: 'auto',
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
};

export default CodeEditor;
