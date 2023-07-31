import React, { useRef, useEffect } from 'react';
import PropTypes from "prop-types";
import { options, btnconfig, getCodeBlocks, selectBlock } from '../EditorCommon/config/Rules';
import { useClient } from '../../context/client-context';
import { useTheme } from '@mui/material/styles';
import { autocomplete } from './config/Autocomplete';
import { ErrorMarker, errChecker } from './config/ErrorMarker';
import { codeParse, requestFromCode } from './config/RequesFromCode';
import './editor.css';
import EditorCommon from '../EditorCommon';

const CodeEditorWindow = ({ onChange, code, onChangeResult }) => {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const lensesRef = useRef(null);
  const autocompleteRef = useRef(null);

  const { client: qdrantClient } = useClient();

  let runBtnCommandId = null;
  let beautifyBtnCommandId = null;

  const theme = useTheme();
  const handleEditorChange = (code) => {
    onChange('code', code);
    errChecker(code);
    monacoRef.current?.editor.setModelMarkers(editorRef.current?.getModel(), 'owner', ErrorMarker);
  };

  useEffect(
    () => () => {
      lensesRef.current?.dispose();
      autocompleteRef.current?.dispose();
    },
    []
  );

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;
    let decorations = [];

    runBtnCommandId = editor.addCommand(
      0,
      async (_ctx, ...args) => {
        const data = args[0];
        const result = await requestFromCode(data);
        onChangeResult('code', JSON.stringify(result));
      },
      ''
    );

    beautifyBtnCommandId = editor.addCommand(
      0,
      async (_ctx, ...args) => {
        const codeBlock = args[0];
        const data = codeParse(codeBlock.blockText);
        if (data.reqBody && Object.keys(data.reqBody).length > 0) {
          const newCodeBlockText = JSON.stringify(data.reqBody, null, 2);
          editor.executeEdits('beautify', [
            {
              forceMoveMarkers: true,
              range: new monaco.Range(
                codeBlock.blockStartLine + 1,
                0,
                codeBlock.blockEndLine,
                editor.getModel().getLineMaxColumn(codeBlock.blockEndLine)
              ),
              text: newCodeBlockText,
            },
          ]);
        }
      },
      ''
    );

    // Register Code Lens Provider (Run Button)
    lensesRef.current = monaco.languages.registerCodeLensProvider(
      'custom-language',
      btnconfig(runBtnCommandId, beautifyBtnCommandId)
    );

    // Listen for Mouse Postion Change
    editor.onDidChangeCursorPosition(() => {
      const currentCode = editor.getValue();
      const currentBlocks = getCodeBlocks(currentCode);

      const selectedCodeBlock = selectBlock(currentBlocks, editor.getPosition().lineNumber);

      monaco.selectedCodeBlock = selectedCodeBlock;

      if (selectedCodeBlock) {
        const fromRange = selectedCodeBlock.blockStartLine;
        const toRange = selectedCodeBlock.blockEndLine;
        // Make the decoration on the selected range
        decorations = editor.deltaDecorations(
          [decorations[0]],
          [
            {
              range: new monaco.Range(fromRange, 0, toRange, 3),
              options: {
                className: theme.palette.mode === 'dark' ? 'blockSelector' : 'blockSelector',
                glyphMarginClassName: theme.palette.mode === 'dark' ? 'blockSelectorStrip' : 'blockSelectorStrip',
                isWholeLine: true,
              },
            },
          ]
        );
        editor.addCommand(monaco.KeyMod.CtrlCmd + monaco.KeyCode.Enter, async () => {
          const data = selectedCodeBlock.blockText;
          const result = await requestFromCode(data);
          onChangeResult('code', JSON.stringify(result));
        });
      }
    });
  }

  function handleEditorWillMount(monaco) {
    autocomplete(monaco, qdrantClient).then((autocomplete) => {
      autocompleteRef.current = monaco.languages.registerCompletionItemProvider('custom-language', autocomplete);
    });
  }

  return (
    <>
      <EditorCommon
        language={'custom-language'}
        value={code}
        theme={'custom-language-theme'}
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

CodeEditorWindow.propTypes = {
  onChange: PropTypes.func.isRequired,
  onChangeResult: PropTypes.func.isRequired,
  code: PropTypes.string.isRequired,
};

export default CodeEditorWindow;
