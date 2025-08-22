import { createTheme as createMuiTheme } from '@mui/material/styles';
import { darkThemeOptions } from './dark-theme';
import { lightThemeOptions } from './light-theme';
import { alpha } from '@mui/material';

const getVariant = ({ theme, ownerState }) => {
  if (ownerState?.variant === 'heading') {
    return {
      padding: '1rem',
      backgroundColor: theme.palette.action.hover,
      // borderRadius: '8px',
    };
  }
};

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
              backgroundColor: alpha(theme.palette.primary.main, 0.05),
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
          Object.assign(styles, getVariant({ theme, ownerState }));


          return styles;
        },
      },
    },
  },
};

export const createTheme = (config) => {
  return createMuiTheme(config.palette.mode === 'dark' ? darkThemeOptions : lightThemeOptions, themeOptions, config);
};
