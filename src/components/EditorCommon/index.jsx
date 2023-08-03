import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import Editor from '@monaco-editor/react';
import { getEditorTheme } from './config/theme';
import { langConfig, Rules } from './config/Rules';
import { useTheme } from '@mui/material/styles';
import { useWindowResize } from '../../hooks/windowHooks';

const EditorCommon = ({ beforeMount, ...props }) => {
  const monacoRef = useRef(null);
  const editorWrapper = useRef(null);
  const theme = useTheme();
  const { height } = useWindowResize();
  const [editorHeight, setEditorHeight] = useState(0);

  function handleEditorWillMount(monaco) {
    monacoRef.current = monaco;
    // Register Custom Language
    monaco.languages.register({ id: 'custom-language' });
    // Defining Rules
    monaco.languages.setMonarchTokensProvider('custom-language', Rules);
    // Defining Theme
    monaco.editor.defineTheme('custom-language-theme', getEditorTheme(theme));

    // Defining Language Configuration, e.g. comments, brackets
    monaco.languages.setLanguageConfiguration('custom-language', langConfig);

    if (typeof beforeMount === 'function') {
      beforeMount(monaco);
    }
  }

  // Monitor if theme changes
  useEffect(() => {
    monacoRef.current?.editor.defineTheme('custom-language-theme', getEditorTheme(theme));
  }, [theme]);

  useEffect(() => {
    setEditorHeight(height - editorWrapper.current?.offsetTop);
  }, [height, editorWrapper]);

  return (
    <div className={theme.palette.mode} ref={editorWrapper}>
      <Editor
        theme={props.theme ?? 'custom-language-theme'} // todo: move to config
        height={editorHeight}
        beforeMount={handleEditorWillMount}
        {...props}
      />
    </div>
  );
};

EditorCommon.propTypes = {
  height: PropTypes.string,
  beforeMount: PropTypes.func,
  ...Editor.propTypes,
};

export default EditorCommon;
