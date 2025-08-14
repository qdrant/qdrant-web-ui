import { alpha } from '@mui/material';
import { primary, blue, red, orange, teal, neutral, lightBlue } from './colors';

const getVariant = ({ theme, ownerState }) => {
  // dual cards have a white background and a 1px border around them
  // in the light theme (alike variant="outlined" cards)
  // and a dark background and no border in the dark theme
  // (alike variant="elevation" elevation={1} cards)
  if (ownerState?.variant === 'dual') {
    return {
      backgroundColor: theme.palette.background.paper,
    };
  }
  if (ownerState?.variant === 'heading') {
    return {
      backgroundColor: alpha(theme.palette.primary.main, 0.05),
    };
  }
};

// these options override the base dark theme
export const darkThemeOptions = {
  palette: {
    common: {
      black: '#000000ff',
      white: '#ffffffff',
    },
    text: {
      primary: neutral[1],
      secondary: neutral[400],
      disabled: neutral[700],
    },
    primary: {
      main: primary[300],
      dark: primary[500],
      light: primary[200],
      contrastText: neutral[950],
    },
    secondary: {
      main: blue[300],
      dark: blue[700],
      light: blue[100],
      contrastText: neutral[950],
    },
    error: {
      main: red[500],
      dark: red[700],
      light: red[300],
      contrastText: neutral[1],
    },
    warning: {
      main: orange[400],
      dark: orange[700],
      light: orange[300],
      contrastText: neutral[950],
    },
    info: {
      main: lightBlue[400],
      dark: lightBlue[700],
      light: lightBlue[300],
      contrastText: neutral[950],
    },
    success: {
      main: teal[400],
      dark: teal[700],
      light: teal[300],
      contrastText: neutral[950],
    },
    action: {
      active: '#fcfdff8f',
      hover: '#fcfdff14',
      selected: '#fcfdff29',
      focus: '#fcfdff1f',
      disabled: '#fcfdff61',
      disabledBackground: '#fcfdff1f',
    },
    background: {
      default: neutral[950],
      paper: '#111824ff',
      card: '#111824ff',
      code: '#1e1e1e',
    },
    divider: '#ffffff1f',
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
            paddingTop: theme.spacing(5),
            minHeight: `calc(100vh - ${theme.spacing(8)})`, // 8 is the height of the AppBar
          };
        },
      },
    },
  },
};
