import { primary, blue, neutral, grey } from './colors';
import { alpha } from '@mui/material/styles';

const lightPalette = {
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
    contrastText: '#FCFDFF',
    main: '#D32F2F',
    _states: {
      hover: 'rgba(211, 47, 47, 0.04)',
      selected: 'rgba(211, 47, 47, 0.08)',
      focus: 'rgba(211, 47, 47, 0.12)',
      focusVisible: 'rgba(211, 47, 47, 0.3)',
      outlinedBorder: 'rgba(211, 47, 47, 0.5)',
    },
  },
  warning: {
    contrastText: '#FCFDFF',
    main: '#EF6C00',
    dark: '#E65100',
    _states: {
      hover: 'rgba(239, 108, 0, 0.04)',
      selected: 'rgba(239, 108, 0, 0.08)',
      focus: 'rgba(239, 108, 0, 0.12)',
      focusVisible: 'rgba(239, 108, 0, 0.3)',
      outlinedBorder: 'rgba(239, 108, 0, 0.5)',
    },
  },
  info: {
    contrastText: '#FCFDFF',
    main: '#0288D1',
    _states: {
      hover: 'rgba(2, 136, 209, 0.04)',
      selected: 'rgba(2, 136, 209, 0.08)',
      focus: 'rgba(2, 136, 209, 0.12)',
      focusVisible: 'rgba(2, 136, 209, 0.3)',
      outlinedBorder: 'rgba(2, 136, 209, 0.5)',
    },
  },
  success: {
    main: '#00897B',
    dark: '#004D40',
    light: '#009688',
    contrastText: '#FCFDFF',
    _states: {
      hover: 'rgba(0, 137, 123, 0.04)',
      selected: 'rgba(0, 137, 123, 0.08)',
      focus: 'rgba(0, 137, 123, 0.12)',
      focusVisible: 'rgba(0, 137, 123, 0.3)',
      outlinedBorder: 'rgba(0, 137, 123, 0.5)',
    },
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
    paperElevation0: '#f7f8faff',
    paperElevation1: '#ffffffff',
    paperElevation2: '#ffffffff',
    paperElevation3: '#ffffffff',
    paperElevation4: '#ffffffff',
    paperElevation5: '#ffffffff',
    paperElevation6: '#ffffffff',
    paperElevation7: '#ffffffff',
    paperElevation8: '#ffffffff',
    paperElevation9: '#ffffffff',
    paperElevation10: '#ffffffff',
    paperElevation11: '#ffffffff',
    paperElevation12: '#ffffffff',
    paperElevation13: '#ffffffff',
    paperElevation14: '#ffffffff',
    paperElevation15: '#ffffffff',
    paperElevation16: '#ffffffff',
    paperElevation17: '#ffffffff',
    paperElevation18: '#ffffffff',
    paperElevation19: '#ffffffff',
    paperElevation20: '#ffffffff',
    paperElevation21: '#ffffffff',
    paperElevation22: '#ffffffff',
    paperElevation23: '#ffffffff',
    paperElevation24: '#ffffffff',
  },
  elevationOutlined: '#e0e0e0ff',
  avatarFill: grey[400],
  inputStandardEnabledBorder: '#0000006b',
  inputStandardHoverBorder: '#000000ff',
  switchKnobFillEnabled: grey[50],
  switchSlideFill: '#000000ff',
  inputFilledEnabledFill: '#0000000f',
  inputOutlinedEnabledBorder: '#0000003b',
  inputOutlinedHoverBorder: '#000000ff',
  ratingEnabledBorder: '#0000003b',
  inputFilledHoverFill: '#00000017',
  ratingActiveFill: '#ffb400ff',
  snackbarFill: '#323232ff',
  chipDefaultCloseFill: '#000000ff',
  chipDefaultHoverFill: '#0000001f',
  chipDefaultEnabledBorder: grey[400],
  tooltipFill: '#616161e5',
  backdropFill: '#00000080',
  appBarDefaultFill: grey[100],
  breadcrumbsCollapseFill: grey[100],
  alertErrorColor: '#5f2120ff',
  stepperConnector: grey[400],
  chipDefaultFocusFill: '#00000033',
  alert: {
    light: {
      standardSuccess: {
        backgroundColor: '#EDF7F5',
        color: '#1E4641',
      },
      standardError: {
        backgroundColor: '#FDEDED',
        color: '#5F2120',
      },
      standardWarning: {
        backgroundColor: '#FFF4E5',
        color: '#663C00',
      },
      standardInfo: {
        backgroundColor: '#E5F6FD',
        color: '#014361',
      },
      filledSuccess: {
        backgroundColor: '#00897B',
        color: '#FFFFFF',
      },
      filledError: {
        backgroundColor: '#D32F2F',
        color: '#FFFFFF',
      },
      filledWarning: {
        backgroundColor: '#EF6C00',
        color: '#FFFFFF',
      },
      filledInfo: {
        backgroundColor: '#0288D1',
        color: '#FFFFFF',
      },
      outlinedSuccess: {
        borderColor: '#1F978B',
        color: '#1E4641',
      },
      outlinedError: {
        borderColor: '#D32F2F',
        color: '#5F2120',
      },
      outlinedWarning: {
        borderColor: '#EF6C00',
        color: '#663C00',
      },
      outlinedInfo: {
        borderColor: '#0288D1',
        color: '#014361',
      },
    },
  },
  switchKnowFillDisabled: grey[100],
  nativeScrollbarBg: grey[200],
  divider: '#0000001f',
};

export const lightThemeOptions = {
  palette: lightPalette,
  components: {
    MuiButton: {
      styleOverrides: {
        outlined: ({ theme }) => ({
          '&.MuiButton-colorTextPrimary': {
            border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
          },
        }),
      },
    },
    MuiAlert: {
      styleOverrides: {
        ...lightPalette.alert.light,
      },
    },
  },
};
