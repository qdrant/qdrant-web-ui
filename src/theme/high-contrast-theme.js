/**
 * High-contrast palette — black & white foundation with only three chromatic
 * accents chosen for universal distinguishability across all forms of color
 * vision deficiency (protanopia, deuteranopia, tritanopia, achromatopsia).
 *
 * Chromatic accents (on #000000 background):
 *   Orange  #FF9100 — error / danger (mid luminance ≈ 0.42, well separated from white)
 *   Cyan    #00E5FF — success / positive (luminance ≈ 0.64, cool)
 *   White   #FFFFFF — info, primary, links, borders (maximum contrast)
 *
 * In greyscale: white (1.0) > cyan (0.64) > orange (0.42) > greys — all clearly
 * distinguishable even with total color blindness (achromatopsia).
 *
 * Everything else is black, white, or grey.
 * MUI palette.mode stays 'dark' so MUI internals apply dark defaults.
 */

const WHITE = '#ffffff';
const BLACK = '#000000';
const ORANGE = '#FF9100';
const CYAN = '#00E5FF';
const GREY = {
  100: '#e0e0e0',
  200: '#c0c0c0',
  300: '#a0a0a0',
  400: '#808080',
  500: '#666666',
  600: '#4d4d4d',
  700: '#333333',
  800: '#1a1a1a',
};

const highContrastPalette = {
  mode: 'dark',
  highContrast: true,
  common: {
    black: `${BLACK}ff`,
    white: `${WHITE}ff`,
  },
  text: {
    primary: WHITE,
    secondary: GREY[200],
    disabled: GREY[400],
  },
  primary: {
    main: WHITE,
    dark: GREY[200],
    light: WHITE,
    contrastText: BLACK,
  },
  secondary: {
    main: GREY[200],
    dark: GREY[300],
    light: GREY[100],
    contrastText: BLACK,
  },
  error: {
    contrastText: BLACK,
    main: ORANGE,
    dark: '#CC7400',
    light: '#FFB74D',
    _states: {
      hover: 'rgba(255, 145, 0, 0.18)',
      selected: 'rgba(255, 145, 0, 0.30)',
      focus: 'rgba(255, 145, 0, 0.22)',
      focusVisible: 'rgba(255, 145, 0, 0.48)',
      outlinedBorder: 'rgba(255, 145, 0, 0.72)',
    },
  },
  warning: {
    contrastText: BLACK,
    main: ORANGE,
    dark: '#CC7400',
    light: '#FFB74D',
    _states: {
      hover: 'rgba(255, 145, 0, 0.18)',
      selected: 'rgba(255, 145, 0, 0.30)',
      focus: 'rgba(255, 145, 0, 0.22)',
      focusVisible: 'rgba(255, 145, 0, 0.48)',
      outlinedBorder: 'rgba(255, 145, 0, 0.72)',
    },
  },
  info: {
    contrastText: BLACK,
    main: WHITE,
    dark: GREY[200],
    light: WHITE,
    _states: {
      hover: 'rgba(255, 255, 255, 0.18)',
      selected: 'rgba(255, 255, 255, 0.30)',
      focus: 'rgba(255, 255, 255, 0.22)',
      focusVisible: 'rgba(255, 255, 255, 0.48)',
      outlinedBorder: 'rgba(255, 255, 255, 0.72)',
    },
  },
  success: {
    main: CYAN,
    dark: '#00B8CC',
    light: '#66EEFF',
    contrastText: BLACK,
    _states: {
      hover: 'rgba(0, 229, 255, 0.18)',
      selected: 'rgba(0, 229, 255, 0.30)',
      focus: 'rgba(0, 229, 255, 0.22)',
      focusVisible: 'rgba(0, 229, 255, 0.48)',
      outlinedBorder: 'rgba(0, 229, 255, 0.72)',
    },
  },
  action: {
    active: '#ffffffcc',
    hover: '#ffffff30',
    selected: '#ffffff45',
    focus: '#ffffff3d',
    disabled: '#ffffff66',
    disabledBackground: '#ffffff24',
  },
  background: {
    default: BLACK,
    paper: GREY[800],
    card: GREY[800],
    code: BLACK,
    paperElevation0: BLACK,
    paperElevation1: GREY[800],
    paperElevation2: GREY[800],
    paperElevation3: GREY[700],
    paperElevation4: GREY[700],
    paperElevation5: GREY[700],
    paperElevation6: GREY[700],
    paperElevation7: GREY[700],
    paperElevation8: GREY[700],
    paperElevation9: GREY[700],
    paperElevation10: GREY[700],
    paperElevation11: GREY[700],
    paperElevation12: GREY[700],
    paperElevation13: GREY[700],
    paperElevation14: GREY[700],
    paperElevation15: GREY[700],
    paperElevation16: GREY[700],
    paperElevation17: GREY[700],
    paperElevation18: GREY[700],
    paperElevation19: GREY[700],
    paperElevation20: GREY[700],
    paperElevation21: GREY[700],
    paperElevation22: GREY[700],
    paperElevation23: GREY[700],
    paperElevation24: GREY[700],
  },
  elevationOutlined: '#ffffff80',
  avatarFill: GREY[400],
  inputStandardEnabledBorder: '#ffffffcc',
  inputStandardHoverBorder: WHITE,
  switchKnobFillEnabled: WHITE,
  switchSlideFill: '#ffffffa0',
  inputFilledEnabledFill: '#ffffff30',
  inputOutlinedEnabledBorder: '#ffffffa0',
  inputOutlinedHoverBorder: WHITE,
  ratingEnabledBorder: '#ffffffa0',
  inputFilledHoverFill: '#ffffff40',
  ratingActiveFill: ORANGE,
  snackbarFill: GREY[800],
  chipDefaultCloseFill: WHITE,
  chipDefaultHoverFill: '#ffffff40',
  chipDefaultEnabledBorder: GREY[300],
  tooltipFill: BLACK,
  backdropFill: '#000000cc',
  appBarDefaultFill: GREY[800],
  breadcrumbsCollapseFill: GREY[300],
  alertErrorColor: '#FFB74D',
  stepperConnector: GREY[300],
  chipDefaultFocusFill: '#ffffff55',
  graphVisualization: {
    nodeDefault: WHITE,
    nodeClicked: ORANGE,
    nodeHighlightRing: CYAN,
    linkDefault: GREY[300],
  },
  alert: {
    dark: {
      standardSuccess: {
        backgroundColor: '#002a2e',
        color: '#B2F5FF',
      },
      standardError: {
        backgroundColor: '#331d00',
        color: '#FFB74D',
      },
      standardWarning: {
        backgroundColor: '#331d00',
        color: '#FFB74D',
      },
      standardInfo: {
        backgroundColor: '#1a1a1a',
        color: WHITE,
      },
      filledSuccess: {
        backgroundColor: CYAN,
        color: BLACK,
      },
      filledError: {
        backgroundColor: ORANGE,
        color: BLACK,
      },
      filledWarning: {
        backgroundColor: ORANGE,
        color: BLACK,
      },
      filledInfo: {
        backgroundColor: WHITE,
        color: BLACK,
      },
      outlinedSuccess: {
        borderColor: CYAN,
        color: '#B2F5FF',
      },
      outlinedError: {
        borderColor: ORANGE,
        color: '#FFB74D',
      },
      outlinedWarning: {
        borderColor: ORANGE,
        color: '#FFB74D',
      },
      outlinedInfo: {
        borderColor: WHITE,
        color: WHITE,
      },
    },
  },
  switchKnowFillDisabled: GREY[500],
  nativeScrollbarBg: GREY[500],
  divider: '#ffffff80',
};

export const highContrastThemeOptions = {
  palette: highContrastPalette,
  components: {
    MuiAlert: {
      styleOverrides: {
        ...highContrastPalette.alert.dark,
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: BLACK,
          color: WHITE,
          border: `1px solid ${WHITE}`,
        },
        arrow: {
          color: BLACK,
          '&::before': {
            border: `1px solid ${WHITE}`,
          },
        },
      },
    },
  },
};
