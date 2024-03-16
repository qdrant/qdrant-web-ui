import React from 'react';
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

ResultEditorWindow.propTypes = {
  code: PropTypes.string.isRequired,
};

export default ResultEditorWindow;
