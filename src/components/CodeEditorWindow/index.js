import React, { useState, useRef } from "react";
import Editor from "@monaco-editor/react";
import { Rules, options, HighlightText } from "./config/Rules"
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
  var range = [];

  const handleEditorChange = (code) => {
    onChange("code", code);
    errChecker(code);
    monacoRef.current?.editor.setModelMarkers(editorRef.current?.getModel(), "owner", ErrorMarker);
  };

  function handleEditorDidMount(editor, monaco) {
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


    //Listen for Mouse Postion Change
    editor.onDidChangeCursorPosition(e => {

      //for Highlighting range Format of result   Array :- [startindexofcode, endindexofcode ]
      range = HighlightText(editor.getPosition(), editor.getValue());
      // Make the decortion on the selected range 
      decorations = editor.deltaDecorations([decorations[0]], [{
        range: new monaco.Range(range[0], 0, range[1], 3),
        options: {
          className: 'grayDecorator',
          glyphMarginClassName: "myGlyphMarginClass",
          isWholeLine: true,
        }
      },]);

      // Add an overlay widget
      var overlayWidget = {
        domNode: (function () {
          var domNode = document.createElement("div");
          domNode.innerHTML = "Run";
          domNode.style.background = "grey";
          domNode.style.right = "16px";
          domNode.style.top = "0px";
          domNode.addEventListener("click", async () => {
            const data = (editor.getModel().getValueInRange(new monaco.Selection(range[0], 0, range[1] + 1, 0)))
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
          });
          editor.onDidChangeCursorSelection(e => {
            domNode.style.top = ((range[0] - 1) * 19) + "px";
          });
          return domNode;
        })(),
        getId: function () {
          return "my.overlay.widget";
        },
        getDomNode: function () {
          return this.domNode;
        },
        getPosition: function () {
          return null;
        },
      };
      editor.addOverlayWidget(overlayWidget);
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