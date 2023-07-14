/* eslint-disable react/prop-types */
import React, { useEffect } from "react";
import EditorCommon from '../EditorCommon';



const VisualizeEditorWindow = ({ code }) => {

  const [editordata, setEditordata] = React.useState("{}");

  const worker = new Worker(new URL('./worker.js', import.meta.url), {
    type: 'module',
  })

  worker.onmessage = (m) => {
    setEditordata(m.data);
  };
  
  useEffect(() => {
    worker.postMessage(code);
  }, [code]);

  function formatJSON(res = {}) {
    try { 
      const val= JSON.stringify(res, null, 2);
      return val;
    } catch {
      const errorJson = {
        error: `HERE ${res}`,
      };
      return JSON.stringify(errorJson, null, 2);
    }
  }

  return (
    <EditorCommon
      language="json"
      theme={"custom-language-theme"}
      value={formatJSON(editordata)}
      options={{
        scrollBeyondLastLine: false,
        fontSize: 12,
        wordWrap: "on",
        minimap: { enabled: false },
        automaticLayout: true,
        readOnly: true,
        mouseWheelZoom: true,
      }}
    />
  );
};
export default VisualizeEditorWindow;