import React, { useState, useRef, useEffect } from "react";

import Editor from "@monaco-editor/react";
// import { options,mylangtheme, languageDef, configuration } from './editor-config'


const CodeEditorWindow = ({ onChange, language, code, theme ,format}) => {

  const editorRef = useRef(null);

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;
    // if (!monaco.languages.getLanguages().some(({ id }) => id === 'estimatemd')) {
    //   // Register a new language
  
    //   monaco.languages.register({ id: 'estimatemd' })
  
    //   // Register a tokens provider for the language
    //   monaco.languages.setMonarchTokensProvider('estimatemd', languageDef)
    //   // Set the editing configuration for the language
  
      
    //   monaco.languages.setLanguageConfiguration('estimatemd', configuration)
    //   monaco.editor.defineTheme("mylangtheme",mylangtheme)
    // }
  }

  useEffect(() => {
    editorRef.current?.focus();
    if(format){
    setTimeout(function() {
      editorRef.current?.getAction('editor.action.formatDocument').run();
    }, 600);}
  }, [code]);




  const handleEditorChange = (code) => {
    onChange("code", code);
  };


  return (

      <Editor
        language={"estimatemd"}
        height="89vh"
        width={`100%`}
        value={code}
        theme={theme}
        defaultValue="// some comment"
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        autoIndent= {true}
        formatOnPaste= {true}
        formatOnType={true}
      />

  );
};
export default CodeEditorWindow;
