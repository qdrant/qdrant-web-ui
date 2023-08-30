import { createTheme as createMuiTheme } from '@mui/material/styles';
import { darkThemeOptions } from './dark-theme';
import { lightThemeOptions } from './light-theme';
import { alpha } from '@mui/material';

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
  },
};

export const createTheme = (config) => {
  return createMuiTheme(config, themeOptions, config.palette.mode === 'dark' ? darkThemeOptions : lightThemeOptions);
};
