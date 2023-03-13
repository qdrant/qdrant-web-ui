import React, { useState, useRef, useEffect } from "react";

import Editor from "@monaco-editor/react";




const ResultEditorWindow = ({ code }) => {
  function formatJSON(val = {}) {
    try {
      const res = JSON.parse(val);
      return JSON.stringify(res, null, 2)
    } catch {
      const errorJson = {
        "error": `非法返回${val}`
      }
      return JSON.stringify(errorJson, null, 2)
    }
  }

  return (
    <div >
      <Editor
        height="90vh"
        language="json"
        value={formatJSON(code)}
        options={{
          scrollBeyondLastLine: false,
          readOnly: false,
          fontSize: 12,
          wordWrap: "on" ,
          minimap: { enabled: false },
          automaticLayout: true,
          readOnly: false,
          mouseWheelZoom:true,
        }}
      />
    </div>
  );
};
export default ResultEditorWindow;
