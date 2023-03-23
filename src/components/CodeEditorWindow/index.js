import React, { useState, useRef } from "react";
import Editor from "@monaco-editor/react";
import { Rules, options, HighlightText, btnconfig } from "./config/Rules"
import { Theme } from "./config/Theme"
import { Autocomplete } from "./config/Autocomplete"
import { ErrorMarker, errChecker } from "./config/ErrorMarker"
import { RequestFromCode } from './config/RequesFromCode'
import ErrorNotifier from "../ToastNotifications/ErrorNotifier"
import "./editor.css"


const CodeEditorWindow = ({ onChange, code, onChangeResult }) => {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  var range = null;

  const handleEditorChange = (code) => {
    onChange("code", code);
    errChecker(code);
    monacoRef.current?.editor.setModelMarkers(editorRef.current?.getModel(), "owner", ErrorMarker);
  };

  function handleEditorDidMount(editor, monaco) {
    var runBtn = null;
    editorRef.current = editor;
    monacoRef.current = monaco;


    var decorations = [];
    // Register Custom Language
    monaco.languages.register({ id: 'custom-language' })
    // Definining Rules 
    monaco.languages.setMonarchTokensProvider('custom-language', Rules);
    // Definining Theme
    monaco.editor.defineTheme('custom-language-theme', Theme);
    // Defining Autocomplete
    monaco.languages.registerCompletionItemProvider('custom-language', Autocomplete);

    const RunBtnControl = editor.addCommand(
      0,
      async () => {
        const data = range[2];
        if (data === "") {
          setHasError(true);
          setErrorMessage("No request selected. Select a request by placing the cursor inside it.")
          return;
        }
        if (data === "\n") {
          setHasError(true);
          setErrorMessage("Empty line selected. Select a request by placing the cursor inside it.")
          return;
        }
        const result = await RequestFromCode(data)
        onChangeResult("code", JSON.stringify(result))
      }
      ,
      ""
    )

    //Listen for Mouse Postion Change
    editor.onDidChangeCursorPosition(e => {

      //for Highlighting range Format of result   Array :- [startindexofcode, endindexofcode ]
      range = HighlightText(editor.getPosition(), editor.getValue())[0] ? HighlightText(editor.getPosition(), editor.getValue()) : range;
      if (range) {
        // Make the decortion on the selected range 
        decorations = editor.deltaDecorations([decorations[0]], [{
          range: new monaco.Range(range[0], 0, range[1], 3),
          options: {
            className: 'grayDecorator',
            glyphMarginClassName: "myGlyphMarginClass",
            isWholeLine: true,
          }
        },]);

        //Dipose the old button if any
        runBtn?.dispose();
        //Make a new btn for the selected range  
        runBtn = monaco.languages.registerCodeLensProvider("custom-language", btnconfig(range, RunBtnControl));
      }
    })
  }

  return (
    < >
      {hasError && <ErrorNotifier {...{ message: errorMessage, setHasError }} />}
      {/* {isSuccess && <SuccessNotifier {...{message: successMessage, setIsSuccess }}/> } */}
      <Editor
        height="90vh"
        language={"custom-language"}
        value={code}
        theme={"custom-language-theme"}
        defaultValue="//input"
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        formatOnPaste={true}
        autoIndent={true}
        formatOnType={true}
        options={options}
      />
    </>
  );
};
export default CodeEditorWindow;