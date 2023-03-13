import React, { useState, useRef, useEffect } from "react";

import Editor from "@monaco-editor/react";

import { Rules, options, HighlightText } from "./config/Rules"

import { Theme } from "./config/Theme"
import { Autocomplete } from "./config/Autocomplete"
import { ErrorMarker } from "./config/ErrorMarker"
import { Button } from "@mui/material";
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import { RequestFromCode } from './config/RequesFromCode'
import { ContentCutOutlined } from "@mui/icons-material";



const CodeEditorWindow = ({ onChange, code, setResult }) => {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const [selectedCodeRange, setselectedCodeRange] = useState([]);
  
  const handleChange = async () => {
    setResult(editorRef.current?.getModel().getValueInRange(new monacoRef.current.Selection(selectedCodeRange[0], 0, selectedCodeRange[1] + 1, 0)))
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
    monacoRef.current = monaco;
    var decorations = [];
    editorRef.current?.onDidChangeCursorPosition(e => {
      var range = HighlightText(editorRef.current?.getPosition(), editorRef.current?.getValue());
      setselectedCodeRange(range);
      decorations = editor.deltaDecorations([decorations[0]], [{
        range: new monaco.Range(range[0], 0, range[1], 3),
        options: {
          className: 'grayDecorator',
          isWholeLine: true,
        }
      },]);
    })
  }




  return (
    <div >
      <Editor
        height="90vh"
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
