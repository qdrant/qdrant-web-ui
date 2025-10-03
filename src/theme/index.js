import { createTheme as createMuiTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import { deepmerge } from '@mui/utils';
import { darkThemeOptions } from './dark-theme';
import { lightThemeOptions } from './light-theme';

const themeOptions = {
  typography: {
    fontFamily: [
      '"Mona Sans"',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      '"Roboto"',
      '"Oxygen"',
      '"Ubuntu"',
      '"Cantarell"',
      '"Fira Sans"',
      '"Droid Sans"',
      '"Helvetica Neue"',
      'sans-serif',
    ].join(', '),
    allVariants: {
      fontFeatureSettings: "'ss01' on, 'ss05' on, 'ss06' on, 'liga' off, 'clig' off",
    },
  },
  components: {
    MuiCardHeader: {
      styleOverrides: {
        root: ({ theme }) => ({
          '&[variant="heading"]': {
            backgroundColor: alpha(theme.palette.action.hover, 0.04),
            padding: '0.625rem 1rem',
            alignItems: 'center',
            '& .MuiCardHeader-title': {
              fontSize: '1.25rem',
              fontStyle: 'normal',
              fontWeight: 500,
              lineHeight: 1,
              letterSpacing: '-0.03125rem',
              marginBottom: '-0.25rem',
            },
          },
        }),
      },
    },
    MuiCard: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: '8px',
          border: `1px solid ${theme.palette.divider}`,
          background: theme.palette.background.paperElevation1,
        }),
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: ({ theme }) => ({
          '&.MuiCardContent-variantHeading': {
            padding: '0.5rem 1rem',
            // child typography with variant="body2"
            '& .MuiTypography-body2': {
              color: theme.palette.text.secondary,
              fontSize: '0.875rem',
              fontStyle: 'normal',
              fontWeight: 400,
              lineHeight: '150%',
            },
          },
        }),
      },
    },
    // tabs overwrite
    MuiTab: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: theme.palette.text.secondary,
          fontSize: '0.875rem',
          fontStyle: 'normal',
          fontWeight: 500,
          lineHeight: 1.4,
          textTransform: 'capitalize',
        }),
      },
    },
    MuiTypography: {
      styleOverrides: {
        subtitle2: {
          fontSize: '0.875rem',
          fontStyle: 'normal',
          fontWeight: 500,
          lineHeight: '150%',
        },
        h4: {
          fontWeight: 600,
          fontSize: '32px',
          lineHeight: 1.25,
          letterSpacing: '-0.5px',
        },
        h5: {
          fontWeight: 600,
          fontSize: '24px',
          lineHeight: 1.3,
        },
        body1: {
          fontSize: '16px',
          fontWeight: 400,
          lineHeight: 1.5,
        },
        body2: {
          fontSize: '14px',
          fontWeight: 400,
          lineHeight: 1.5,
        },
        subtitle1: {
          fontSize: '16px',
          fontWeight: 500,
          lineHeight: 1.5,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '0.5rem',
          padding: '0.5rem 1rem',
          fontSize: '0.875rem',
          fontStyle: 'normal',
          fontWeight: 500,
          lineHeight: '1.4',
          textTransform: 'capitalize',
        },
        outlinedInherit: ({ theme }) => ({
          border: `1px solid ${theme.palette.divider}`,
          color: theme.palette.text.primary,
          '&:hover': {
            backgroundColor: theme.palette.action.hover,
            border: `1px solid ${theme.palette.divider}`,
          },
        }),
        containedPrimary: ({ theme }) => ({
          background: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          boxShadow: 'none',
          '&:hover': {
            background: theme.palette.primary.dark,
            boxShadow: 'none',
          },
        }),
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          textDecorationThickness: '1px',
          textUnderlineOffset: '2px',
          '&:hover': {
            textDecorationThickness: '1px',
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: '0.5rem',
          padding: '0.375rem 1rem',
          fontSize: '0.875rem',
          fontWeight: 400,
          lineHeight: 1.5,
          '& .MuiAlert-icon': {
            fontSize: '1.375rem',
            marginRight: '0.75rem',
            padding: '0.4375rem 0',
          },
          '& .MuiAlert-message': {
            padding: '0.5rem 0',
            '& .MuiAlertTitle-root': {
              fontSize: '1rem',
              fontWeight: 500,
              lineHeight: 1.5,
              marginBottom: '0.25rem',
            },
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: '0.5rem',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '0.5rem',
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: '0.5rem',
        },
      },
    },
  },
};

const baseTheme = createMuiTheme(themeOptions);

export const createTheme = (config) => {
  const theme = deepmerge(
    deepmerge(baseTheme, config.palette.mode === 'dark' ? darkThemeOptions : lightThemeOptions),
    config
  );
  return createMuiTheme(theme);
};
