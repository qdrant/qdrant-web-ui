import React from 'react';
import Editor from 'react-simple-code-editor';
import { styled } from '@mui/material/styles';

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

StyledEditor.propTypes = {
  ...Editor.propTypes,
};

export default StyledEditor;
