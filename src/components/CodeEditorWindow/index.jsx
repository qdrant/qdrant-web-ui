/* eslint-disable react/prop-types */
import React, { useState, useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import {
  Rules,
  options,
  btnconfig,
  GetCodeBlocks,
  selectBlock,
  langConfig,
} from "./config/Rules";
import { Theme } from "./config/Theme";
import { Autocomplete } from "./config/Autocomplete";
import { ErrorMarker, errChecker } from "./config/ErrorMarker";
import { RequestFromCode } from "./config/RequesFromCode";
import { useTheme } from "@mui/material/styles";
import ErrorNotifier from "../ToastNotifications/ErrorNotifier";
import "./editor.css";

const CodeEditorWindow = ({ onChange, code, onChangeResult }) => {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const lensesRef = useRef(null);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  let runBtnCommandId = null;

  const theme = useTheme();
  const handleEditorChange = (code) => {
    onChange("code", code);
    errChecker(code);
    monacoRef.current?.editor.setModelMarkers(
      editorRef.current?.getModel(),
      "owner",
      ErrorMarker
    );
  };

  useEffect(
    () => () => {
      lensesRef.current?.dispose();
    },
    []
  );

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;
    var decorations = [];

    runBtnCommandId = editor.addCommand(
      0,
      async (_ctx, ...args) => {
        let data = args[0];
        if (data === "") {
          setHasError(true);
          setErrorMessage(
            "No request selected. Select a request by placing the cursor inside it."
          );
          return;
        }
        if (data === "\n") {
          setHasError(true);
          setErrorMessage(
            "Empty line selected. Select a request by placing the cursor inside it."
          );
          return;
        }
        const result = await RequestFromCode(data);
        onChangeResult("code", JSON.stringify(result));
      },
      ""
    );

    // Register Code Lens Provider (Run Button)
    lensesRef.current = monaco.languages.registerCodeLensProvider(
      "custom-language",
      btnconfig(runBtnCommandId)
    );

    //Listen for Mouse Postion Change
    editor.onDidChangeCursorPosition((e) => {
      let currentCode = editor.getValue();
      let currentBlocks = GetCodeBlocks(currentCode);

      let selectedCodeBlock = selectBlock(
        currentBlocks,
        editor.getPosition().lineNumber
      );

      monaco.selectedCodeBlock = selectedCodeBlock;

      if (selectedCodeBlock) {
        let fromRange = selectedCodeBlock.blockStartLine;
        let toRange = selectedCodeBlock.blockEndLine;
        // Make the decortion on the selected range
        decorations = editor.deltaDecorations(
          [decorations[0]],
          [
            {
              range: new monaco.Range(fromRange, 0, toRange, 3),
              options: {
                className: theme.palette.mode === "dark" ? "blockSelector" : "blockSelector",
                glyphMarginClassName: theme.palette.mode === "dark" ? "blockSelectorStrip" : "blockSelectorStrip",
                isWholeLine: true,
              },
            },
          ]
        );
        editor.addCommand(
          monaco.KeyMod.CtrlCmd + monaco.KeyCode.Enter,
          async () => {
            let data = selectedCodeBlock.blockText;
            const result = await RequestFromCode(data);
            onChangeResult("code", JSON.stringify(result));
          }
        );
      }
    });
  }
  function handleEditorWillMount(monaco) {
    monacoRef.current = monaco;
    // Register Custom Language
    monaco.languages.register({ id: "custom-language" });
    // Definining Rules
    monaco.languages.setMonarchTokensProvider("custom-language", Rules);
    // Definining Theme
    monaco.editor.defineTheme("custom-language-theme", Theme(theme));

    // Defining Language Configuration, e.g. comments, brackets
    monaco.languages.setLanguageConfiguration('custom-language', langConfig);
    // Defining Autocomplete
    Autocomplete(monaco).then((autocomplete) => {
      monaco.languages.registerCompletionItemProvider(
        "custom-language",
        autocomplete
      );
    });
  }

  // Monitor if theme changes
  useEffect(() => {
    monacoRef.current?.editor.defineTheme("custom-language-theme", Theme(theme));
  }, [theme]);

  return (
    <>
      {hasError && (
        <ErrorNotifier {...{ message: errorMessage, setHasError }} />
      )}
      {/* {isSuccess && <SuccessNotifier {...{message: successMessage, setIsSuccess }}/> } */}
      <div className={ theme.palette.mode }>
        <Editor
          height="82vh"
          language={"custom-language"}
          value={code}
          theme={"custom-language-theme"}
          defaultValue="//input"
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          beforeMount={handleEditorWillMount}
          formatOnPaste={true}
          autoIndent={true}
          formatOnType={true}
          options={options}
        />
      </div>
    </>
  );
};
export default CodeEditorWindow;
