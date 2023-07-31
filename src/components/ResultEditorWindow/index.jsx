/* eslint-disable react/prop-types */
import React from 'react';
import EditorCommon from '../EditorCommon';

const ResultEditorWindow = ({ code }) => {
  function formatJSON(val = {}) {
    try {
      const res = JSON.parse(val);
      return JSON.stringify(res, null, 2);
    } catch {
      const errorJson = {
        error: `HERE ${val}`,
      };
      return JSON.stringify(errorJson, null, 2);
    }
  }
  return (
    <EditorCommon
      language="json"
      theme={'custom-language-theme'}
      value={formatJSON(code)}
      options={{
        scrollBeyondLastLine: false,
        fontSize: 12,
        wordWrap: 'on',
        minimap: { enabled: false },
        automaticLayout: true,
        readOnly: true,
        mouseWheelZoom: true,
      }}
    />
  );
};
export default ResultEditorWindow;
