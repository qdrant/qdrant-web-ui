import { createTheme as createMuiTheme } from '@mui/material/styles';
import { darkThemeOptions } from './dark-theme';
import { lightThemeOptions } from './light-theme';
import { alpha } from '@mui/material';

// order of applying theme options:
// config.palette.mode === 'dark' ? darkThemeOptions : lightThemeOptions
// this file `themeOptions`
// config given to `createTheme`
const themeOptions = {
  components: {
    MuiCardHeader: {
      styleOverrides: {
        // this adds variant="heading" support
        // to the CardHeader component
        root: ({ theme, ownerState }) => {
          if (ownerState?.variant === 'heading') {
            return {
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
            };
          }
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        // this adds variant="dual" and variant="heading" support
        // to the Card component
        root: ({ theme, ownerState }) => {
          const styles = {
            borderRadius: '8px',
            border: `1px solid ${theme.palette.divider}`,
            background: theme.palette.background.paperElevation1,
            // todo: fix this, so that hover only works on clickable elements
            // '&:hover': {
            //   background: theme.palette.background.paperElevation8,
            //   boxShadow:
            //     '0 3px 14px 2px rgba(0, 0, 0, 0.12), ' +
            //     '0 8px 10px 1px rgba(0, 0, 0, 0.14), ' +
            //     '0 5px 5px -3px rgba(0, 0, 0, 0.20)',
            // },
          };

          // add getVariant styles
          // Object.assign(styles, getVariant({ theme, ownerState }));

          if (ownerState?.variant === 'heading') {
            styles.padding = '1rem 1.25rem';
            styles.backgroundColor = theme.palette.action.hover;
          }

          return styles;
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: ({ theme, ownerState }) => {
          if (ownerState?.variant === 'heading') {
            return {
              padding: '0.5rem 1rem',
              // child typography with variant="body2"
              '& .MuiTypography-body2': {
                color: theme.palette.text.secondary,
                fontSize: '0.875rem',
                fontStyle: 'normal',
                fontWeight: 400,
                lineHeight: '150%',
              },
            };
          }
        },
      },
    },
    // tabs overwrite
    MuiTab: {
      styleOverrides: {
        root: {
          color: 'text.secondary',
          fontSize: '0.875rem',
          fontStyle: 'normal',
          fontWeight: 500,
          lineHeight: 1.4,
          textTransform: 'capitalize',
        },
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
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '8px',
          padding: '6px 16px',
          fontSize: '14px',
          fontStyle: 'normal',
          fontWeight: 500,
          lineHeight: '140%',
          textTransform: 'capitalize',
        },
        containedPrimary: ({ theme }) => {
          return {
            background: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
          };
        },
        outlined: ({ theme, ownerState }) => {
          if (ownerState.color === 'text.primary') {
            return {
              border: `1px solid ${theme.palette.divider}`,
            };
          }
        },
        text: ({ theme }) => {
          return {
            border: `1px solid ${theme.palette.divider}`,
          };
        },
      },
    },
  },
};

export const createTheme = (config) => {
  // Create the base theme with our typography settings first
  const baseTheme = createMuiTheme({
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
  });

  // Then apply the mode-specific options and component overrides
  return createMuiTheme(
    baseTheme,
    config.palette.mode === 'dark' ? darkThemeOptions : lightThemeOptions,
    themeOptions,
    config
  );
};
