import { useTheme } from '@mui/material/styles';
import { red, blue, neutral, yellow } from './colors';

/**
 * Creates a custom JsonViewer theme that integrates with the app's theme system
 * @param {Object} theme - MUI theme object
 * @return {Object} JsonViewer colorspace
 */
export const createJsonViewerTheme = (theme) => {
  const isDark = theme.palette.mode === 'dark';
  
  return {
    theme: {
    scheme: 'qdrant-custom',
    author: 'Qdrant Web UI',
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
    },
    overrides: {
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
    },
  };
};

/**
 * Hook to get the current JsonViewer theme based on app theme
 * @return {Object} JsonViewer colorspace
 */
export const useJsonViewerTheme = () => {
  const theme = useTheme();
  return createJsonViewerTheme(theme);
};
