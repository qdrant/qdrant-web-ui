/* eslint-disable react/prop-types */
import React, { useEffect, useMemo } from "react";
import EditorCommon from "../EditorCommon";

const VisualizeEditorWindow = ({ scrollResult }) => {

  const [editorData, setEditorData] = React.useState("{}");
  useEffect(() => {
    const worker = new Worker(new URL("./worker.js", import.meta.url), {
      type: "module",
    });

    worker.onmessage = (m) => {
      setEditorData(m.data);
    };

    worker.postMessage(scrollResult);

    return () => {
      worker.terminate();
    };
  }, [scrollResult]);

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
      value={formatJSON(editorData)}
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