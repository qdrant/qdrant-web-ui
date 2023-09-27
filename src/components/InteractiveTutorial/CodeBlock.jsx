import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Highlight, Prism, themes } from 'prism-react-renderer';
import { alpha, Box, Button } from '@mui/material';
import { requestFromCode } from '../CodeEditorWindow/config/RequesFromCode';
import { useTutorial } from '../../context/tutorial-context';
import { useTheme } from '@mui/material/styles';
import { PlayArrowOutlined } from '@mui/icons-material';
import { CopyButton } from '../Common/CopyButton';
import { DARK_BACKGROUND, LIGHT_BACKGROUND } from './MarkdownComponents';

// TODO:
// - [x] Add run button
// - [x] Context for code?
// - [x] Add theme switching with main theme
// - [x] In requestFromCode - history
// - [x] Add more styles
// - [x] Add tests
// - [x] custom alert without div
// - [ ] Refactor
// later:
// - [ ] usePrismTheme hook - doesn't look like it's needed
// - [ ] Add editor - next step

export const RunButton = ({ code }) => {
  const { setResult } = useTutorial();
  const handleClick = () => {
    requestFromCode(code, false).then((res) => {
      if (res && res.status === 'ok') {
        setResult(() => JSON.stringify(res));
      } else {
        setResult(() => JSON.stringify(res));
      }
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

export const CodeBlock = (props) => {
  const { children } = props;
  const className = children.props.className || '';
  const code = children.props.children.trim();
  const language = className.replace(/language-/, '');
  const withRunButton = children.props.withRunButton && JSON.parse(children.props.withRunButton);
  const theme = useTheme();
  const prismTheme = theme.palette.mode === 'light' ? themes.nightOwlLight : themes.vsDark;
  const backgroundColor = theme.palette.mode === 'light' ? LIGHT_BACKGROUND : DARK_BACKGROUND;

  useEffect(() => {
    window.Prism = Prism; // (or check for window is undefined for ssr and use global)
    (async () => await import('prismjs/components/prism-json'))();
  }, []);

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
        <Highlight code={code} language={language} theme={prismTheme} prism={Prism}>
          {({ className, style, tokens, getLineProps, getTokenProps }) => {
            return (
              <pre
                className={className}
                style={{
                  overflowX: 'scroll',
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
      </Box>
    </Box>
  );
};

CodeBlock.propTypes = {
  children: PropTypes.object,
};
