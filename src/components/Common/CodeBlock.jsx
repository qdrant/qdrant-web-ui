import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Highlight, Prism, themes } from 'prism-react-renderer';
import Editor from 'react-simple-code-editor';
import { alpha, Box, Button, CircularProgress } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import { PlayArrowOutlined } from '@mui/icons-material';
import { CopyButton } from './CopyButton';

const StyledEditor = styled((props) => <Editor padding={0} textareaClassName={'code-block-textarea'} {...props} />)({
  fontFamily: '"Menlo", monospace',
  fontSize: '16px',
  lineHeight: '24px',
  fontWeight: '400',
  '& .code-block-textarea': {
    margin: '1rem 0 !important',
    outline: 'none',
  },
});

/**
 * Run button for code block
 * @param {string} code
 * @param {function} onRun
 * @return {JSX.Element}
 * @constructor
 */
export const RunButton = ({ code, onRun, loading }) => {
  return (
    <Button
      variant="outlined"
      endIcon={loading ? <CircularProgress size={24} color="inherit" /> : <PlayArrowOutlined />}
      onClick={() => onRun(code)}
      disabled={loading}
      data-testid="code-block-run"
    >
      {loading ? 'Running...' : 'Run'}
    </Button>
  );
};

RunButton.propTypes = {
  code: PropTypes.string.isRequired,
  onRun: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

/**
 * Code block with syntax highlighting
 * @return {JSX.Element}
 * @constructor
 */
export const CodeBlock = ({ codeStr, language, withRunButton, onRun, title, editable = true, loading }) => {
  const [code, setCode] = useState(codeStr);
  const theme = useTheme();
  const prismTheme = theme.palette.mode === 'light' ? themes.nightOwlLight : themes.vsDark;

  useEffect(() => {
    setCode(codeStr);
  }, [codeStr]);

  const handleChange = (code) => {
    setCode(() => code);
  };

  const highlight = (code) => (
    <Highlight code={code} language={language} theme={prismTheme} prism={Prism}>
      {({ className, style, tokens, getLineProps, getTokenProps }) => {
        return (
          <pre
            className={className}
            style={{
              wordBreak: 'keep-all',
              whiteSpace: 'pre-wrap',
              ...style,
            }}
            data-testid={'code-block-pre'}
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
        my: 3,
      }}
      data-testid={'code-block'}
    >
      <Box
        display={'flex'}
        alignItems={'center'}
        px={2}
        py={1}
        sx={{
          background: alpha(theme.palette.primary.main, 0.05),
        }}
      >
        {withRunButton && onRun && (
          <Box sx={{ flexGrow: '1' }}>
            <RunButton code={code} onRun={onRun} loading={loading} />
          </Box>
        )}
        {title && <Box>{title}</Box>}
        <Box sx={{ flexGrow: '1' }} />
        <CopyButton text={code} />
      </Box>
      <Box sx={{ px: 2, pb: 1 }}>
        {withRunButton && editable && (
          <StyledEditor
            value={code}
            onValueChange={handleChange}
            highlight={highlight}
            data-testid={'code-block-editor'}
          />
        )}
        {((withRunButton && !editable) || !withRunButton) && highlight(code)}
      </Box>
    </Box>
  );
};

CodeBlock.propTypes = {
  codeStr: PropTypes.string.isRequired,
  language: PropTypes.string,
  withRunButton: PropTypes.bool,
  onRun: PropTypes.func,
  title: PropTypes.string,
  editable: PropTypes.bool, // by default code block is editable
  loading: PropTypes.bool,
};
