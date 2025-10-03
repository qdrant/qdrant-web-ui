import { red, blue, neutral } from '../../../theme/colors';

export const getEditorTheme = (theme, themeName = 'custom-language-theme') => {
  if (theme.palette.mode === 'dark') {
    return THEMES[themeName](theme).dark;
  } else {
    return THEMES[themeName](theme).light;
  }
};

const THEMES = {
  'custom-language-theme': (theme) => ({
    dark: {
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
        'editor.background': theme.palette.background.default,
      },
    },
    light: {
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
        'editor.background': theme.palette.background.default,
      },
    },
  }),
  'qdrant-theme': (theme) => {
    const isDark = theme.palette.mode === 'dark';
    return {
      dark: {
        base: 'vs-dark',
        rules: [
          { token: 'keyword', foreground: theme.palette.warning.main },
          { token: 'string.key', foreground: red[600] },
          { token: 'string.value', foreground: blue[600] },
          { token: 'number', foreground: blue[600] },
          { token: 'comment', foreground: isDark ? neutral[500] : neutral[400] },

          { token: 'string', foreground: red[600] },
        ],
        colors: {
          'editor.foreground': theme.palette.text.primary,
          'editor.background': theme.palette.background.code,
        },
      },
      light: {
        base: 'vs',
        rules: [
          { token: 'keyword', foreground: theme.palette.warning.main },
          { token: 'string.key', foreground: red[600] },
          { token: 'string.value', foreground: blue[600] },
          { token: 'number', foreground: blue[600] },
          { token: 'comment', foreground: isDark ? neutral[500] : neutral[400] },

          { token: 'string', foreground: red[600] },
        ],
        colors: {
          'editor.foreground': theme.palette.text.primary,
          'editor.background': theme.palette.background.code,
        },
      },
    };
  },
};
