import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { alpha, Box, Button, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { PlayArrowOutlined } from '@mui/icons-material';
import { CopyButton } from './CopyButton';
import CodeEditor from './CodeEditor';

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
      variant="contained"
      endIcon={loading ? <CircularProgress size={24} color="inherit" /> : <PlayArrowOutlined sx={{ fontSize: 18 }} />}
      onClick={() => onRun(code)}
      disabled={loading}
      data-testid="code-block-run"
      sx={{ height: '2rem', lineHeight: '2rem', fontSize: '0.8125rem' }}
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

  useEffect(() => {
    setCode(codeStr);
  }, [codeStr]);

  const handleChange = (code) => {
    setCode(() => code);
  };

  return (
    <Box
      sx={{
        background: theme.palette.background.code,
        borderRadius: '0.5rem',
        border: '1px solid',
        borderColor: theme.palette.divider,
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
          background:
            theme.palette.mode === 'light' ? theme.palette.action.hover : alpha(theme.palette.primary.main, 0.05),
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
        <CodeEditor
          value={code}
          language={language}
          onChange={withRunButton && editable ? handleChange : undefined}
          readOnly={!withRunButton || !editable}
          data-testid={'code-block-editor'}
        />
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
  withOutput: PropTypes.bool,
};
