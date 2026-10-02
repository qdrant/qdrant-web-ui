import React from 'react';
import PropTypes from 'prop-types';
import EditorCommon from '../EditorCommon';
import { useFormattedJSON } from '../../hooks/useFormattedJSON';

const ResultEditorWindow = ({ code, customHeight }) => {
  const lineHeight = 21;
  const padding = 16;

  const { formattedCode } = useFormattedJSON(code, { lineHeight, padding });

  return (
    <EditorCommon
      customHeight={customHeight}
      language="json"
      theme={'custom-language-theme'}
      value={formattedCode}
      options={{
        scrollBeyondLastLine: false,
        fontSize: 14,
        wordWrap: 'on',
        minimap: { enabled: false },
        automaticLayout: true,
        readOnly: true,
        mouseWheelZoom: true,
        folding: true,
        lineHeight: lineHeight,
        padding: { top: padding, bottom: padding },
      }}
    />
  );
};

ResultEditorWindow.propTypes = {
  code: PropTypes.string.isRequired,
  customHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

export default ResultEditorWindow;
