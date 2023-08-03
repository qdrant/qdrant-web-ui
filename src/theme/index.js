import { createTheme as createMuiTheme } from '@mui/material/styles';
import { darkThemeOptions } from './dark-theme';
import { lightThemeOptions } from './light-theme';

export const createTheme = (config) => {
  return createMuiTheme(config, config.palette.mode === 'dark' ? darkThemeOptions : lightThemeOptions);
};
