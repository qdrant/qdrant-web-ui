import React, { useState, useRef, useEffect } from "react";

import Editor from "@monaco-editor/react";

import { Rules, options, HighlightText } from "./config/Rules"

import { Theme } from "./config/Theme"
import { Autocomplete } from "./config/Autocomplete"
import { ErrorMarker } from "./config/ErrorMarker"
import { Button, Box } from "@mui/material";
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import { RequestFromCode } from './config/RequesFromCode'
import ErrorNotifier from "../ToastNotifications/ErrorNotifier"



const CodeEditorWindow = ({ onChange, code, onChangeResult }) => {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const [selectedCodeRange, setselectedCodeRange] = useState([]);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");


  const handleChange = async () => {
    const data=(editorRef.current?.getModel().getValueInRange(new monacoRef.current.Selection(selectedCodeRange[0], 0, selectedCodeRange[1] + 1, 0)))
    if(data=="\n"){
      setHasError(true);
      setErrorMessage("Select the correct line")
    } 
    const result =await RequestFromCode(editorRef.current?.getModel().getValueInRange(new monacoRef.current.Selection(selectedCodeRange[0], 0, selectedCodeRange[1] + 1, 0)))
      onChangeResult("code",JSON.stringify(result))
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
          glyphMarginClassName: "myGlyphMarginClass",
          isWholeLine: true,
        }
      },]);
    })
  }
  return (
    <div >
      {hasError && <ErrorNotifier {...{message: errorMessage, setHasError }} /> }
      {/* {isSuccess && <SuccessNotifier {...{message: successMessage, setIsSuccess }}/> } */}
      <Box
        display="flex"
        justifyContent="flex-end"
        alignItems="flex-end"
      >
      <Button onClick={handleChange} color="success" variant="contained" sx={{ height: 40 }}>
        <ArrowRightIcon />
        RUN
      </Button>
      </Box>

      <Editor
        height="84vh"
        language={"mylang"}
        value={code}
        theme={"mylang-theme"}
        defaultValue="//input"
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        formatOnPaste= {true}
        autoIndent= {true}
        formatOnType= {true}
        options={options}
      />
    </div>
  );
};
export default CodeEditorWindow; 
