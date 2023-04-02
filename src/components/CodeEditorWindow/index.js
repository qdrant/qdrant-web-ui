/* eslint-disable react/prop-types */
import React, { useState, useRef } from "react";
import Editor from "@monaco-editor/react";
import { Rules, options, btnconfig, GetCodeBlocks, selectBlock } from "./config/Rules"
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
  let runBtnCommandId = null;

  const handleEditorChange = (code) => {
    onChange("code", code);
    errChecker(code);
    monacoRef.current?.editor.setModelMarkers(editorRef.current?.getModel(), "owner", ErrorMarker);
  };

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;
    var decorations = [];

    runBtnCommandId = editor.addCommand(
      0,
      async (_ctx, ...args) => {
        let data = args[0];
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

    // Register Code Lens Provider (Run Button)
    monaco.languages.registerCodeLensProvider("custom-language", btnconfig(runBtnCommandId));

    //Listen for Mouse Postion Change
    editor.onDidChangeCursorPosition(e => {
      let currentCode = editor.getValue();
      let currentBlocks = GetCodeBlocks(currentCode);

      let selectedCodeBlock = selectBlock(currentBlocks, editor.getPosition().lineNumber);

      if (selectedCodeBlock) {
        let fromRange = selectedCodeBlock.blockStartLine;
        let toRange = selectedCodeBlock.blockEndLine;
        // Make the decortion on the selected range 
        decorations = editor.deltaDecorations([decorations[0]], [
          {
            range: new monaco.Range(fromRange, 0, toRange, 3),
            options: {
              className: 'grayDecorator',
              glyphMarginClassName: "myGlyphMarginClass",
              isWholeLine: true,
            }
          }
        ]);
      }
    })
  }
  function  handleEditorWillMount( monaco) {
    monacoRef.current = monaco;
    // Register Custom Language
    monaco.languages.register({ id: 'custom-language' })
    // Definining Rules 
    monaco.languages.setMonarchTokensProvider('custom-language', Rules);
    // Definining Theme
    monaco.editor.defineTheme('custom-language-theme', Theme);
    // Defining Autocomplete
    monaco.languages.registerCompletionItemProvider('custom-language', Autocomplete); 
  }

  return (
    < >
      {hasError && <ErrorNotifier {...{ message: errorMessage, setHasError }} />}
      {/* {isSuccess && <SuccessNotifier {...{message: successMessage, setIsSuccess }}/> } */}
      <Editor
        height="82vh"
        language={"custom-language"}
        value={code}
        // theme={"custom-language-theme"}
        defaultValue="//input"
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        beforeMount={handleEditorWillMount}
        formatOnPaste={true}
        autoIndent={true}
        formatOnType={true}
        options={options}
      />
    </>
  );
};
export default CodeEditorWindow;