// import { alpha } from '@mui/material';
import { primary, blue, red, orange, teal, neutral, lightBlue, grey } from './colors';

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
  // if (ownerState?.variant === 'heading') {
  //   return {
  //     backgroundColor: alpha(theme.palette.primary.main, 0.05),
  //   };
  // }
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
      code: '#111824',
      paperElevation0: neutral[950],
      paperElevation1: '#111824ff',
      paperElevation2: '#141a2aff',
      paperElevation3: '#171d2cff',
      paperElevation4: '#191f2eff',
      paperElevation5: '#1c2130ff',
      paperElevation6: '#1e2433ff',
      paperElevation7: '#1e2433ff',
      paperElevation8: '#212635ff',
      paperElevation9: '#212635ff',
      paperElevation10: '#232937ff',
      paperElevation11: '#232937ff',
      paperElevation12: '#262b3aff',
      paperElevation13: '#262b3aff',
      paperElevation14: '#262b3aff',
      paperElevation15: '#282e3cff',
      paperElevation16: '#282e3cff',
      paperElevation17: '#282e3cff',
      paperElevation18: '#282e3cff',
      paperElevation19: '#282e3cff',
      paperElevation20: '#2b303eff',
      paperElevation21: '#2b303eff',
      paperElevation22: '#2b303eff',
      paperElevation23: '#2b303eff',
      paperElevation24: '#2b303eff',
    },
    elevationOutlined: '#ffffff1f',
    avatarFill: grey[600],
    inputStandardEnabledBorder: '#ffffff6b',
    inputStandardHoverBorder: '#ffffffff',
    switchKnobFillEnabled: grey[300],
    switchSlideFill: '#ffffff61',
    inputFilledEnabledFill: '#ffffff17',
    inputOutlinedEnabledBorder: '#ffffff3b',
    inputOutlinedHoverBorder: '#ffffffff',
    ratingEnabledBorder: '#ffffff3b',
    inputFilledHoverFill: '#ffffff1f',
    ratingActiveFill: '#ffb400ff',
    snackbarFill: '#1e2433ff',
    chipDefaultCloseFill: '#ffffffff',
    chipDefaultHoverFill: '#ffffff1f',
    chipDefaultEnabledBorder: grey[700],
    tooltipFill: '#616161e5',
    backdropFill: '#00000080',
    appBarDefaultFill: '#191f2eff',
    breadcrumbsCollapseFill: grey[600],
    alertErrorColor: '#f4c7c7ff',
    stepperConnector: grey[600],
    chipDefaultFocusFill: '#ffffff33',
    alertErrorBackground: '#291414ff',
    alertWarningColor: '#ffe2b7ff',
    alertWarningBackground: '#291d0bff',
    alertInfoColor: '#b8e7fbff',
    alertInfoBackground: '#0c2029ff',
    alertSuccessColor: '#cce8cdff',
    alertSuccessBackground: '#1a291cff',
    switchKnowFillDisabled: grey[600],
    nativeScrollbarBg: grey[700],
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
