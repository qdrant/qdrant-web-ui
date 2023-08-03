export const getEditorTheme = (theme) => {
  if (theme.palette.mode === 'dark') {
    return {
      base: 'vs-dark',
      rules: [
        { token: 'keyword', foreground: '#007acc' },
        { token: 'string.key', foreground: '#f14c4c' },
        { token: 'string.value', foreground: '#3794ff' },
        { token: 'number', foreground: '#098658' },
        { token: 'comment', foreground: '#6A9955' },

        { token: 'string', foreground: '#f14c4c' },
      ],
      colors: {
        'editor.foreground': '#FFFFFF',
      },
    };
  } else {
    return {
      base: 'vs',
      rules: [
        { token: 'keyword', foreground: '#0000FF' },
        { token: 'string.key', foreground: '#A31515' },
        { token: 'string.value', foreground: '#0451A5' },
        { token: 'number', foreground: '#098658' },
        { token: 'comment', foreground: '#008000' },

        { token: 'string', foreground: '#A31515' },
      ],
      colors: {
        'editor.foreground': '#000000',
      },
    };
  }
};
