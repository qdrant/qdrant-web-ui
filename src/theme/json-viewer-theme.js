import { useTheme } from '@mui/material/styles';
import { red, blue, neutral, yellow } from './colors';

const THEMES = {
  'qdrant-custom': {
    scheme: 'qdrant-custom',
    author: 'Qdrant Web UI',
    getColors: (theme) => {
      const isDark = theme.palette.mode === 'dark';
      return {
        base00: theme.palette.background.paperElevation1, // Default Background
        // base01: isDark ? neutral[800] : neutral[100],    // Lighter Background (unused)
        base02: isDark ? neutral[700] : neutral[200], // Borders and Background for types NaN, null, and undefined
        // base03: isDark ? neutral[600] : neutral[300],    // Comments, Invisibles, Line Highlighting (unused)
        base04: isDark ? neutral[500] : neutral[400], // Item Size
        base05: red[600], // Default Foreground, Brackets, and Colons
        base06: isDark ? neutral[300] : neutral[600], // Light Foreground (unused)
        base07: red[600], // Keys, Colons, and Brackets
        base08: theme.palette.error.main, // Color for NaN
        base09: blue[600], // Ellipsis and String Values
        base0A: theme.palette.warning.main, // Regular Expressions and Null Values
        base0B: blue[600], // Floating-Point Values
        base0C: red[600], // Number Keys
        base0D: isDark ? neutral[500] : neutral[400], // Icons, Search Input, Date
        base0E: theme.palette.warning.main, // Booleans and Expanded Icons
        base0F: blue[600], // Integers
      };
    },
    getOverrides: (theme) => {
      const isDark = theme.palette.mode === 'dark';
      return {
        fontSize: '0.75rem',
        lineHeight: '150%',
        '& .data-object-start': {
          color: yellow[600],
        },
        '& .data-object-end': {
          color: yellow[600],
        },
        '& .MuiSvgIcon-root': {
          color: isDark ? neutral[500] : neutral[400],
        },
      };
    },
  },
  info: {
    scheme: 'info',
    author: 'Qdrant Web UI',
    getColors: (theme) => {
      const isDark = theme.palette.mode === 'dark';
      return {
        base00: theme.palette.background.paperElevation1, // Default Background
        // base01: isDark ? neutral[800] : neutral[100],    // Lighter Background (unused)
        base02: isDark ? neutral[700] : neutral[200], // Borders and Background for types NaN, null, and undefined
        // base03: isDark ? neutral[600] : neutral[300],    // Comments, Invisibles, Line Highlighting (unused)
        base04: theme.palette.text.secondary, // Item Size - Line numbers
        base05: theme.palette.text.secondary, // Default Foreground - Keys and colons
        base06: isDark ? neutral[300] : neutral[600], // Light Foreground (unused)
        base07: theme.palette.text.secondary, // Keys, Colons, and Brackets - Mapped to text.secondary
        base08: theme.palette.error.main, // Color for NaN
        base09: theme.palette.success.main, // Ellipsis and String Values - Mapped to success.main
        base0A: theme.palette.error.main, // Regular Expressions and Null Values - Mapped to error.main
        base0B: theme.palette.success.main, // Floating-Point Values - Mapped to success.main
        base0C: theme.palette.text.secondary, // Number Keys - Mapped to text.secondary
        base0D: theme.palette.text.secondary, // Icons, Search Input, Date - Mapped to text.secondary
        base0E: theme.palette.warning.main, // Booleans and Expanded Icons - Mapped to warning.main
        base0F: theme.palette.warning.main, // Integers - Mapped to warning.main
      };
    },
    getOverrides: (theme) => {
      return {
        fontSize: '0.75rem',
        lineHeight: '150%',
        '& .data-object-start': {
          color: theme.palette.warning.main, // Yellow brackets - Mapped to warning.main
        },
        '& .data-object-end': {
          color: theme.palette.warning.main, // Yellow brackets - Mapped to warning.main
        },
        '& .MuiSvgIcon-root': {
          color: theme.palette.text.secondary, // Icons - Mapped to text.secondary
        },
      };
    },
  },
};

/**
 * Creates a custom JsonViewer theme that integrates with the app's theme system
 * @param {Object} theme - MUI theme object
 * @param {string} themeName - Name of the JsonViewer theme to use (default: 'qdrant-custom')
 * @return {Object} JsonViewer colorspace
 */
export const createJsonViewerTheme = (theme, themeName = 'qdrant-custom') => {
  const selectedTheme = THEMES[themeName] || THEMES['qdrant-custom'];

  return {
    theme: {
      scheme: selectedTheme.scheme,
      author: selectedTheme.author,
      ...selectedTheme.getColors(theme),
    },
    overrides: selectedTheme.getOverrides(theme),
  };
};

/**
 * Hook to get the current JsonViewer theme based on app theme
 * @param {string} themeName - Name of the JsonViewer theme to use (default: 'qdrant-custom')
 * @return {Object} JsonViewer colorspace
 */
export const useJsonViewerTheme = (themeName = 'qdrant-custom') => {
  const theme = useTheme();
  return createJsonViewerTheme(theme, themeName);
};
