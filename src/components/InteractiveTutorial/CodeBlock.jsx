import React from 'react';
import PropTypes from 'prop-types';
import { Highlight, themes } from 'prism-react-renderer';
import { Box, Button } from '@mui/material';
import { requestFromCode } from '../CodeEditorWindow/config/RequesFromCode';
import { useTutorial } from '../../context/tutorial-context';

// TODO:
// - [x] Add run button
// - [x] Context for code?
// - [ ] Add theme switching with main theme
// - [ ] Add editor
// - [ ] In requestFromCode - history
// - [ ] Add tests
// - [ ] Add more styles

export const RunButton = ({ code }) => {
  const { setResult } = useTutorial();
  const handleClick = () => {
    requestFromCode(code).then((res) => {
      if (res && res.status === 'ok') {
        setResult(() => JSON.stringify(res.result));
      }
    });
  };
  return (
    <Button variant="text" onClick={handleClick}>
      Run
    </Button>
  );
};

RunButton.propTypes = {
  code: PropTypes.string.isRequired,
};

export const CodeBlock = ({ children }) => {
  const className = children.props.className || '';
  const code = children.props.children.trim();
  const language = className.replace(/language-/, '');
  const file = children.props.file;
  const theme = themes.duotoneLight;

  return (
    <Box
      sx={{
        background: 'rgb(250, 248, 245)',
        borderRadius: '0.5rem',
        my: 3,
      }}
    >
      <Box sx={{ flexGrow: '1' }}>
        <RunButton code={code} />
      </Box>
      <Box sx={{ px: 2 }}>
        <Highlight code={code} language={language} theme={theme}>
          {({ className, style, tokens, getLineProps, getTokenProps }) => (
            <pre className={className} style={style}>
              {<div>{file && `File: ${file}`}</div>}
              {tokens.map((line, i) => (
                <div key={i} {...getLineProps({ line, key: i })}>
                  {line.map((token, key) => (
                    <span key={token} {...getTokenProps({ token, key })} />
                  ))}
                </div>
              ))}
            </pre>
          )}
        </Highlight>
      </Box>
    </Box>
  );
};

CodeBlock.propTypes = {
  children: PropTypes.object,
};
