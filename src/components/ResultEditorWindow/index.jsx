import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import EditorCommon from '../EditorCommon';
import { bigIntJSON } from '../../common/bigIntJSON';

const ResultEditorWindow = ({ code }) => {
  function formatJSON(val = {}) {
    try {
      const res = bigIntJSON.parse(val);
      return bigIntJSON.stringify(res, null, 2);
    } catch {
      const errorJson = {
        error: `HERE ${val}`,
      };
      return bigIntJSON.stringify(errorJson, null, 2);
    }
  }

  const lineHeight = 21;
  const padding = 16;

  const { formattedCode, editorHeight } = useMemo(() => {
    const formatted = formatJSON(code);
    const lineCount = formatted.split('\n').length;
    const calculatedHeight = Math.max(60, lineCount * lineHeight + padding + padding);
    return {
      formattedCode: formatted,
      editorHeight: `${calculatedHeight}px`,
    };
  }, [code]);

  return (
    <EditorCommon
      language="json"
      theme={'custom-language-theme'}
      value={formattedCode}
      customHeight={editorHeight}
      options={{
        scrollBeyondLastLine: false,
        fontSize: 14,
        wordWrap: 'on',
        minimap: { enabled: false },
        automaticLayout: true,
        readOnly: true,
        mouseWheelZoom: true,
        folding: false,
        lineHeight: lineHeight,
        padding: { top: padding, bottom: padding },
      }}
    />
  );
};

ResultEditorWindow.propTypes = {
  code: PropTypes.string.isRequired,
};

export default ResultEditorWindow;
