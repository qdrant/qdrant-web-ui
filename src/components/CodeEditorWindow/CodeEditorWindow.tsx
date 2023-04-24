import { useState, useRef, useEffect, useCallback } from "react";
import Editor, { Monaco, OnMount } from "@monaco-editor/react";
import {
  Rules,
  options,
  btnconfig,
  GetCodeBlocks,
  selectBlock,
} from "./config/Rules";
import { Theme } from "./config/Theme";
import { Autocomplete } from "./config/Autocomplete";
import { ErrorMarker, errChecker } from "./config/ErrorMarker";
import { RequestFromCode } from "./config/RequesFromCode";
import { ErrorNotifier } from "../ToastNotifications/ErrorNotifier";
import "./editor.css";
import { useHotkeys } from "@mantine/hooks";

type CodeEditorWindowProps = {
  onChange: (key: string, value: string) => void;
  code: string;
  onChangeResult: (value: string, code: string) => void;
};
export const CodeEditorWindow = ({
  onChange,
  code,
  onChangeResult,
}: CodeEditorWindowProps) => {
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const lensesRef = useRef<any>(null);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentCodeBlock, setCurrentCodeBlock] = useState("");
  let runBtnCommandId: any = null;

  const handleOnclick = useCallback(async () => {
    const result: string = await RequestFromCode(currentCodeBlock);
    onChangeResult("code", JSON.stringify(result));
  }, [currentCodeBlock]);

  useHotkeys([["ctrl+Enter", () => handleOnclick()]], ["button"], true);

  const handleEditorChange = (code?: string) => {
    code && onChange("code", code);
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

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    let decorations: any[] = [];
    runBtnCommandId = editor.addCommand(
      0,
      async (_ctx: any, ...args: any) => {
        const data = args[0];
        console.log("data", data);
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
        const result: string = await RequestFromCode(data);
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
    editor.onDidChangeCursorPosition((e: any) => {
      const currentCode = editor.getValue();
      const currentBlocks = GetCodeBlocks(currentCode);

      const selectedCodeBlock = selectBlock(
        currentBlocks,
        editor.getPosition().lineNumber
      );

      if (selectedCodeBlock) {
        const fromRange = selectedCodeBlock.blockStartLine;
        const toRange = selectedCodeBlock.blockEndLine;
        // Make the decortion on the selected range
        decorations = editor.deltaDecorations(
          [decorations[0]],
          [
            {
              range: new monaco.Range(fromRange, 0, toRange, 3),
              options: {
                className: "grayDecorator",
                glyphMarginClassName: "myGlyphMarginClass",
                isWholeLine: true,
              },
            },
          ]
        );
        console.log(selectedCodeBlock);
        setCurrentCodeBlock(selectedCodeBlock.blockText);
      }
    });
  };
  function handleEditorWillMount(monaco: Monaco) {
    monacoRef.current = monaco;
    // Register Custom Language
    monaco.languages.register({ id: "custom-language" });
    // Definining Rules
    monaco.languages.setMonarchTokensProvider("custom-language", Rules);
    // Definining Theme
    monaco.editor.defineTheme("custom-language-theme", Theme);
    // Defining Autocomplete
    monaco.languages.registerCompletionItemProvider(
      "custom-language",
      Autocomplete
    );
  }

  return (
    <>
      {hasError && (
        <ErrorNotifier {...{ message: errorMessage, setHasError }} />
      )}
      {/* {isSuccess && <SuccessNotifier {...{message: successMessage, setIsSuccess }}/> } */}
      <Editor
        height="82vh"
        language={"custom-language"}
        value={code}
        theme={"custom-language-theme"}
        defaultValue="//input"
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        beforeMount={handleEditorWillMount}
        // @ts-expect-error
        formatOnPaste={true}
        autoIndent={true}
        formatOnType={true}
        options={options}
      />
    </>
  );
};
