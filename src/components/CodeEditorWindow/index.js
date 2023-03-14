import React, { useState, useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { Rules, options, HighlightText } from "./config/Rules"
import { Theme } from "./config/Theme"
import { Autocomplete } from "./config/Autocomplete"
import { ErrorMarker, errChecker } from "./config/ErrorMarker"
import { RequestFromCode } from './config/RequesFromCode'
import ErrorNotifier from "../ToastNotifications/ErrorNotifier"



const CodeEditorWindow = ({ onChange, code, onChangeResult }) => {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  var range = [];


  const handleRun = async () => {
    const data = (editorRef.current?.getModel().getValueInRange(new monacoRef.current.Selection(range[0], 0, range[1] + 1, 0)))
    if (data == "") {
      setHasError(true);
      setErrorMessage("No request selected. Select a request by placing the cursor inside it.")
      return;
    }
    if (data == "\n") {
      setHasError(true);
      setErrorMessage("Empty line selected. Select a request by placing the cursor inside it.")
      return;
    }
    const result = await RequestFromCode(data)
    onChangeResult("code", JSON.stringify(result))
  }

  const handleEditorChange = (code) => {
    onChange("code", code);
    errChecker(code);
    monacoRef.current?.editor.setModelMarkers(editorRef.current?.getModel(), "owner", ErrorMarker);
  };




  function handleEditorDidMount(editor, monaco) {
    var sts = null;
    editorRef.current = editor;
    monacoRef.current = monaco;
    var decorations = [];
    var commandId = editor.addCommand(
      0,
      function () {
        // services available in `ctx`
        handleRun();
      },
      ""
    );
    // Register 
    monaco.languages.register({ id: 'mylang' })
    // Definining Rules 
    monaco.languages.setMonarchTokensProvider('mylang', Rules);
    monaco.editor.defineTheme('mylang-theme', Theme);
    monaco.languages.registerCompletionItemProvider('mylang', Autocomplete);
    editor.onDidChangeCursorPosition(e => {
      range = HighlightText(editor.getPosition(), editor.getValue());
      // setselectedCodeRange(range);
      decorations = editor.deltaDecorations([decorations[0]], [{
        range: new monaco.Range(range[0], 0, range[1], 3),
        options: {
          className: 'grayDecorator',
          glyphMarginClassName: "myGlyphMarginClass",
          isWholeLine: true,
        }
      },]);
      sts?.dispose();
      sts = monaco.languages.registerCodeLensProvider("mylang", {
        provideCodeLenses: function (model, token) {
          return {
            lenses: [
              {
                range: {
                  startLineNumber: range[0],
                  startColumn: 1,
                  endLineNumber: range[0],
                  endColumn: 1,
                },
                id: "RUN",
                command: {
                  id: commandId,
                  title: "RUN",
                },
              },
            ],
            dispose: () => { },
          };
        },
        resolveCodeLens: function (model, codeLens, token) {
          return codeLens;
        },
      });
    })
  }

  return (
    < >
      {hasError && <ErrorNotifier {...{ message: errorMessage, setHasError }} />}
      {/* {isSuccess && <SuccessNotifier {...{message: successMessage, setIsSuccess }}/> } */}
      <Editor
        height="90vh"
        language={"mylang"}
        value={code}
        theme={"mylang-theme"}
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