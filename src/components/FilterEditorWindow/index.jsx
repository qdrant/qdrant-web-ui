/* eslint-disable react/prop-types */
import React, { useRef, useEffect } from "react";
import {
  options,
  btnconfig,
  GetCodeBlocks,
  selectBlock,
} from "./config/Rules";
import { useParams } from "react-router-dom";
import { useClient } from "../../context/client-context";
import { useTheme } from "@mui/material/styles";
import { Autocomplete } from "./config/Autocomplete";
import { RequestFromCode } from "./config/RequesFromCode";
import "./editor.css";
import EditorCommon from '../EditorCommon';

const CodeEditorWindow = ({ onChange, code, onChangeResult }) => {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const lensesRef = useRef(null);
  const autocompleteRef = useRef(null);
  const { collectionName } = useParams();


  const { client: qdrantClient } = useClient();

  let runBtnCommandId = null;

  const theme = useTheme();

  useEffect(
    () => () => {
      lensesRef.current?.dispose();
      autocompleteRef.current?.dispose();
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
        const result = await RequestFromCode(data,collectionName);
        onChangeResult(result);
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
            const result = await RequestFromCode(data, collectionName);
            onChangeResult( result);
          }
        );
      }
    });
  }
  function handleEditorWillMount(monaco) {
    Autocomplete(monaco, qdrantClient).then((autocomplete) => {
      autocompleteRef.current = monaco.languages.registerCompletionItemProvider(
        "custom-language",
        autocomplete
      );
    });
  }

  return (
        <EditorCommon
          language={"custom-language"}
          value={code}
          theme={"custom-language-theme"}
          defaultValue="//input"
          onChange={onChange}
          onMount={handleEditorDidMount}
          beforeMount={handleEditorWillMount}
          formatOnPaste={true}
          autoIndent={true}
          formatOnType={true}
          options={options}
        />
  );
};
export default CodeEditorWindow;
