import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Highlight, Prism, themes } from 'prism-react-renderer';
import Editor from 'react-simple-code-editor';
import { alpha, Box, Button } from '@mui/material';
import { requestFromCode } from '../../CodeEditorWindow/config/RequesFromCode';
import { useTutorial } from '../../../context/tutorial-context';
import { styled, useTheme } from '@mui/material/styles';
import { PlayArrowOutlined } from '@mui/icons-material';
import { CopyButton } from '../../Common/CopyButton';
import { DARK_BACKGROUND, LIGHT_BACKGROUND } from './MdxComponents';
import { bigIntJSON } from '../../../common/bigIntJSON';

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
 * @return {JSX.Element}
 * @constructor
 */
export const RunButton = ({ code }) => {
  const { setResult } = useTutorial();
  const handleClick = () => {
    setResult('{}');
    requestFromCode(code, false)
      .then((res) => {
        setResult(() => bigIntJSON.stringify(res));
      })
      .catch((err) => {
        setResult(() => bigIntJSON.stringify(err));
      });
  };
  return (
    <Button variant="outlined" endIcon={<PlayArrowOutlined />} onClick={handleClick} data-testid="code-block-run">
      Run
    </Button>
  );
};

RunButton.propTypes = {
  code: PropTypes.string.isRequired,
};

/**
 * Code block with syntax highlighting
 * @param {object} children - code block content from mdx
 * @return {JSX.Element}
 * @constructor
 */
export const CodeBlock = ({ children }) => {
  const className = children.props.className || '';
  const [code, setCode] = useState(children.props.children.trim());
  const language = className.replace(/language-/, '');
  const withRunButton = children.props.withRunButton && bigIntJSON.parse(children.props.withRunButton);
  const theme = useTheme();
  const prismTheme = theme.palette.mode === 'light' ? themes.nightOwlLight : themes.vsDark;
  const backgroundColor = theme.palette.mode === 'light' ? LIGHT_BACKGROUND : DARK_BACKGROUND;

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
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line, key: i })}>
                {line.map((token, key) => (
                  <span key={token} {...getTokenProps({ token, key })} />
                ))}
              </div>
            ))}
          </pre>
        );
      }}
    </Highlight>
  );

  return (
    <Box
      sx={{
        background: backgroundColor,
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
        {withRunButton && (
          <Box sx={{ flexGrow: '1' }}>
            <RunButton code={code} />
          </Box>
        )}
        <Box sx={{ flexGrow: '1' }} />
        <CopyButton text={code} />
      </Box>
      <Box sx={{ px: 2, pb: 1 }}>
        {withRunButton && (
          <StyledEditor
            value={code}
            onValueChange={handleChange}
            highlight={highlight}
            data-testid={'code-block-editor'}
          />
        )}
        {!withRunButton && highlight(code)}
      </Box>
    </Box>
  );
};

CodeBlock.propTypes = {
  children: PropTypes.shape({
    props: PropTypes.shape({
      className: PropTypes.string,
      children: PropTypes.string.isRequired,
      withRunButton: PropTypes.string,
    }),
  }),
};
