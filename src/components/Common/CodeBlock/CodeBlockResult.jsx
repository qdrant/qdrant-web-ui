import React from 'react';
import PropTypes from 'prop-types';
import CodeEditor from '../CodeEditor';
import { useFormattedJSON } from '../../../hooks/useFormattedJSON';

const CodeBlockResult = ({ code }) => {
  const { formattedCode } = useFormattedJSON(code);

  return <CodeEditor value={formattedCode} language="json" readOnly={true} />;
};

CodeBlockResult.propTypes = {
  code: PropTypes.string.isRequired,
};

export default CodeBlockResult;

