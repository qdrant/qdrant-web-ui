import { alpha } from '@mui/material';
import { primary, blue, red, orange, teal, neutral, lightBlue } from './colors';

const getVariant = ({ theme, ownerState }) => {
  // this adds variant="dual" support to the Card component
  // dual cards have a white background and a 1px border around them
  // in the light theme (alike variant="outlined" cards)
  // and a dark background and no border in the dark theme
  // (alike variant="elevation" elevation={1} cards)
  if (ownerState?.variant === 'dual') {
    return {
      border: `1px solid ${theme.palette.divider}`,
    };
  }
  if (ownerState?.variant === 'heading') {
    return {
      backgroundColor: alpha(theme.palette.primary.main, 0.05),
    };
  }
};

// these options override the base light theme
export const lightThemeOptions = {
  palette: {
    common: {
      black: '#000000ff',
      white: '#ffffffff',
    },
    text: {
      primary: neutral[900],
      secondary: neutral[600],
      disabled: neutral[400],
    },
    primary: {
      main: primary[500],
      dark: primary[600],
      light: primary[400],
      contrastText: neutral[1],
    },
    secondary: {
      main: blue[500],
      dark: blue[700],
      light: blue[300],
      contrastText: neutral[1],
    },
    error: {
      main: red[700],
      dark: red[800],
      light: red[400],
      contrastText: neutral[1],
    },
    warning: {
      main: orange[800],
      dark: orange[900],
      light: orange[500],
      contrastText: neutral[1],
    },
    info: {
      main: lightBlue[700],
      dark: lightBlue[900],
      light: lightBlue[500],
      contrastText: neutral[1],
    },
    success: {
      main: teal[600],
      dark: teal[900],
      light: teal[500],
      contrastText: neutral[1],
    },
    action: {
      active: '#0b0f198f',
      hover: '#0b0f190a',
      selected: '#0b0f1914',
      focus: '#0b0f191f',
      disabled: '#0b0f1961',
      disabledBackground: '#0b0f191f',
    },
    background: {
      default: '#f7f8faff',
      paper: '#ffffffff',
      code: '#ffffff',
    },
    divider: '#0000001f',
  },
  components: {
    MuiCard: {
      styleOverrides: {
        // this adds variant="dual" and variant="heading" support
        // to the Card component
        root: getVariant,
      },
    },
    MuiPaper: {
      styleOverrides: {
        // this adds variant="dual" and variant="heading" support
        // to the Paper component
        root: getVariant,
      },
    },
    MuiCreateCollectionForm: {
      styleOverrides: {
        root: ({ theme }) => {
          return {
            backgroundColor: 'transparent',
            paddingTop: theme.spacing(5),
            minHeight: `calc(100vh - ${theme.spacing(8)})`, // 8 is the height of the AppBar
          };
        },
      },
    },
  },
};
