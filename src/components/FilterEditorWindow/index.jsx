import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { options, btnconfig, getCodeBlocks, selectBlock } from './config/Rules';
import { useParams } from 'react-router-dom';
import { useClient } from '../../context/client-context';
import { useTheme } from '@mui/material/styles';
import { autocomplete } from './config/Autocomplete';
import { useSnackbar } from 'notistack';
import { bigIntJSON } from '../../common/bigIntJSON';
import './editor.css';
import EditorCommon from '../EditorCommon';

const CodeEditorWindow = ({ onChange, code, onChangeResult, customRequestSchema, customHeight = null }) => {
  const { enqueueSnackbar } = useSnackbar();
  const editorRef = useRef(null);
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

  function codeParse(codeText) {
    // Parse JSON
    if (codeText) {
      try {
        return bigIntJSON.parse(codeText);
      } catch (e) {
        return {
          reqBody: codeText,
          error: 'Fix the position brackets to run & check the json',
        };
      }
    }
  }

  function onRun(codeText) {
    const data = codeParse(codeText);
    if (data.error) {
      enqueueSnackbar(`Visualization Unsuccessful, error: ${JSON.stringify(data.error)}`, {
        variant: 'error',
      });
      return data;
    }
    onChangeResult(data, collectionName);
  }

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;
    let decorations = [];

    runBtnCommandId = editor.addCommand(
      0,
      async (_ctx, ...args) => {
        onRun(args[0]);
      },
      ''
    );

    // Register Code Lens Provider (Run Button)
    lensesRef.current = monaco.languages.registerCodeLensProvider('custom-language', btnconfig(runBtnCommandId));

    // Listen for Mouse Postion Change
    editor.onDidChangeCursorPosition(() => {
      const currentCode = editor.getValue();
      const currentBlocks = getCodeBlocks(currentCode);

      const selectedCodeBlock = selectBlock(currentBlocks, editor.getPosition().lineNumber);

      monaco.editor.selectedCodeBlock = selectedCodeBlock;

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
                className: theme.palette.mode === 'dark' ? 'blockSelector' : 'blockSelector',
                glyphMarginClassName: theme.palette.mode === 'dark' ? 'blockSelectorStrip' : 'blockSelectorStrip',
                isWholeLine: true,
              },
            },
          ]
        );
        editor.addCommand(monaco.KeyMod.CtrlCmd + monaco.KeyCode.Enter, async () => {
          const data = selectedCodeBlock.blockText;
          onRun(data);
        });
      }
    });
  }
  function handleEditorWillMount(monaco) {
    autocomplete(monaco, qdrantClient, collectionName, customRequestSchema).then((autocomplete) => {
      autocompleteRef.current = monaco.languages.registerCompletionItemProvider('custom-language', autocomplete);
    });
  }

  return (
    <EditorCommon
      customHeight={customHeight}
      language={'custom-language'}
      value={code}
      theme={'custom-language-theme'}
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

CodeEditorWindow.propTypes = {
  onChange: PropTypes.func.isRequired,
  code: PropTypes.string.isRequired,
  onChangeResult: PropTypes.func.isRequired,
  customRequestSchema: PropTypes.func.isRequired,
  customHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};
export default CodeEditorWindow;
