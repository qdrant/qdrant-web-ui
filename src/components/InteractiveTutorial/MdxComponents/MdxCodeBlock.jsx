import React from 'react';
import PropTypes from 'prop-types';
import { requestFromCode } from '../../CodeEditorWindow/config/RequesFromCode';
import { bigIntJSON } from '../../../common/bigIntJSON';
import { Box, Typography, useTheme } from '@mui/material';
import { CodeBlock } from '../../Common/CodeBlock/CodeBlock';
import CodeBlockResult from '../../Common/CodeBlock/CodeBlockResult';

/**
 * Code block with syntax highlighting
 * @param {object} children - code block content from mdx
 * @return {JSX.Element}
 * @constructor
 */
export const MdxCodeBlock = ({ children }) => {
  const theme = useTheme();
  const className = children.props.className || '';
  const code = children.props.children.trim();
  const language = className.replace(/language-/, '');
  const withRunButton = children.props.withRunButton && bigIntJSON.parse(children.props.withRunButton);
  const [result, setResult] = React.useState('{}');
  const [loading, setLoading] = React.useState(false);
  const resultRef = React.useRef(null);

  // Scroll to result
  React.useEffect(() => {
    if (result && result !== '{}' && resultRef.current) {
      resultRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [result]);

  const handleRun = (code) => {
    setLoading(true);
    setResult('{}');
    requestFromCode(code, false)
      .then((res) => {
        setResult(() => bigIntJSON.stringify(res));
        setLoading(false);
      })
      .catch((err) => {
        setResult(() => bigIntJSON.stringify(err));
        setLoading(false);
      });
  };

  return (
    <>
      <CodeBlock codeStr={code} language={language} withRunButton={withRunButton} onRun={handleRun} loading={loading} />
      {result && result !== '{}' && (
        <Box ref={resultRef} sx={{ mt: 2 }}>
          <Typography variant="subtitle1" mb={2}>
            Result
          </Typography>
          <Box sx={{ borderRadius: '0.5rem', overflow: 'hidden', border: `1px solid ${theme.palette.divider}` }}>
            <CodeBlockResult code={result} />
          </Box>
        </Box>
      )}
    </>
  );
};

MdxCodeBlock.propTypes = {
  children: PropTypes.shape({
    props: PropTypes.shape({
      className: PropTypes.string,
      children: PropTypes.string.isRequired,
      withRunButton: PropTypes.string,
    }),
  }),
};
