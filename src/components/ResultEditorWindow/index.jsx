/* eslint-disable no-unused-vars */
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import CodeEditor from '../Common/CodeEditor';
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

  return <CodeEditor value={formattedCode} language="json" readOnly={true} />;
};

ResultEditorWindow.propTypes = {
  code: PropTypes.string.isRequired,
};

export default ResultEditorWindow;
