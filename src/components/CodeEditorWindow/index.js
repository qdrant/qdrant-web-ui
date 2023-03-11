import React, { useState, useRef, useEffect } from "react";

import Editor from "@monaco-editor/react";

import { Rules, options, HighlightText } from "./config/Rules"

import { Theme } from "./config/Theme"
import { Autocomplete } from "./config/Autocomplete"
import { ErrorMarker } from "./config/ErrorMarker"
import { Button } from "@mui/material";
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import {RequestFromCode} from './config/RequesFromCode'



const CodeEditorWindow = ({ onChange, code ,setResult}) => {

  const editorRef = useRef(null);

  const handleChange = async() => {
    const response=await RequestFromCode(code);
    setResult(JSON.stringify(response))
}


  const handleEditorChange = (code) => {
    onChange("code", code);
  };
  function handleEditorDidMount(editor, monaco) {
    monaco.languages.register({ id: 'mylang' })
    monaco.languages.setMonarchTokensProvider('mylang', Rules);
    monaco.editor.defineTheme('mylang-theme', Theme);
    monaco.languages.registerCompletionItemProvider('mylang', Autocomplete);
    monaco.editor.setModelMarkers(editor.getModel(), "owner", ErrorMarker);
    editorRef.current = editor;
    var decorations = [];
    editorRef.current?.onDidChangeCursorPosition(e => {
      var range = HighlightText(editorRef.current?.getPosition(), editorRef.current?.getValue());
      console.log(range)
      decorations = editor.deltaDecorations([decorations[0]], [{
        range: new monaco.Range(range[0], 0, range[1], 3),
        options: {
          className: 'grayDecorator',
          isWholeLine: true,
        }
      },]);
    })}




return (
      <div className="overlay rounded-md overflow-hidden w-full h-full shadow-4xl">
        <Button className="monaco-placeholder" onClick={handleChange}>
          <ArrowRightIcon/>
        </Button>
        <Editor
          height="85vh"
          width={`100%`}
          language={"mylang"}
          value={code}
          theme={"mylang-theme"}
          defaultValue="//output"
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          options={options}
        />
      </div>
    );
  };
  export default CodeEditorWindow;
