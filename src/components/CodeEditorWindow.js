import React, { useState, useRef, useEffect } from "react";

import Editor from "@monaco-editor/react";

const CodeEditorWindow = ({ onChange, language, code, theme }) => {

  const editorRef = useRef(null);

  useEffect(() => {
    editorRef.current?.focus();
    setTimeout(function() {
      editorRef.current?.getAction('editor.action.formatDocument').run();
    }, 600);
  }, [code]);




  const handleEditorChange = (code) => {
    onChange("code", code);
  };


  return (
    <div className="overlay rounded-md overflow-hidden w-full h-full shadow-4xl">


      <Editor
        height="85vh"
        width={`100%`}
        language={"json"}
        value={code}
        theme={theme}
        defaultValue="// some comment"
        onChange={handleEditorChange}
        onMount={(editor) => (editorRef.current = editor)}
        autoIndent= {true}
        formatOnPaste= {true}
        formatOnType={true}
      />
    </div>
  );
};
export default CodeEditorWindow;
