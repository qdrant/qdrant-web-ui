import { useTheme } from '@mui/material/styles';
import { amber, red, blue, green, neutral, yellow } from './colors';

const THEMES = {
  'qdrant-custom': {
    getStyle: (theme) => {
      const isDark = theme.palette.mode === 'dark';
      const hc = theme.palette.highContrast;
      const bracketColor = hc ? theme.palette.text.primary : yellow[600];
      const keyColor = hc ? theme.palette.text.primary : red[600];
      const arrowColor = hc ? theme.palette.text.secondary : isDark ? neutral[500] : neutral[400];

      return {
        fontSize: '0.75rem',
        lineHeight: '150%',
        '--w-rjv-background-color': theme.palette.background.paperElevation1,
        '--w-rjv-color': keyColor,
        '--w-rjv-key-string': keyColor,
        '--w-rjv-key-number': hc ? theme.palette.text.secondary : red[600],
        '--w-rjv-info-color': hc ? theme.palette.text.secondary : isDark ? neutral[500] : neutral[400],
        '--w-rjv-arrow-color': arrowColor,
        '--w-rjv-line-color': isDark ? `${neutral[700]}80` : `${neutral[200]}80`,
        '--w-rjv-curlybraces-color': bracketColor,
        '--w-rjv-brackets-color': bracketColor,
        '--w-rjv-colon-color': keyColor,
        '--w-rjv-quotes-color': keyColor,
        '--w-rjv-quotes-string-color': hc ? '#00E5FF' : blue[600],
        '--w-rjv-ellipsis-color': hc ? '#00E5FF' : blue[600],
        '--w-rjv-type-string-color': hc ? '#00E5FF' : blue[600],
        '--w-rjv-type-int-color': hc ? '#FF9100' : blue[600],
        '--w-rjv-type-float-color': hc ? '#00E5FF' : blue[600],
        '--w-rjv-type-bigint-color': hc ? '#FF9100' : blue[600],
        '--w-rjv-type-boolean-color': theme.palette.warning.main,
        '--w-rjv-type-date-color': hc ? theme.palette.text.secondary : isDark ? neutral[500] : neutral[400],
        '--w-rjv-type-null-color': theme.palette.warning.main,
        '--w-rjv-type-nan-color': theme.palette.error.main,
        '--w-rjv-type-undefined-color': theme.palette.warning.main,
      };
    },
    getColorspace: (theme) => {
      const isDark = theme.palette.mode === 'dark';
      const hc = theme.palette.highContrast;
      return {
        base02: hc ? '#333333' : isDark ? neutral[700] : neutral[200],
        base08: theme.palette.error.main,
        base09: hc ? '#00E5FF' : blue[600],
        base0B: hc ? '#00E5FF' : blue[600],
        base0D: hc ? theme.palette.text.secondary : isDark ? neutral[500] : neutral[400],
        base0E: theme.palette.warning.main,
        base0F: hc ? '#FF9100' : blue[600],
      };
    },
  },
  info: {
    getStyle: (theme) => {
      const isDark = theme.palette.mode === 'dark';

      return {
        fontSize: '0.75rem',
        lineHeight: '150%',
        '--w-rjv-background-color': theme.palette.background.paperElevation1,
        '--w-rjv-color': theme.palette.text.secondary,
        '--w-rjv-key-string': theme.palette.text.secondary,
        '--w-rjv-key-number': theme.palette.text.secondary,
        '--w-rjv-info-color': theme.palette.text.secondary,
        '--w-rjv-arrow-color': theme.palette.text.secondary,
        '--w-rjv-line-color': isDark ? `${neutral[700]}80` : `${neutral[200]}80`,
        '--w-rjv-curlybraces-color': theme.palette.warning.main,
        '--w-rjv-brackets-color': theme.palette.warning.main,
        '--w-rjv-colon-color': theme.palette.text.secondary,
        '--w-rjv-quotes-color': theme.palette.text.secondary,
        '--w-rjv-quotes-string-color': theme.palette.success.main,
        '--w-rjv-ellipsis-color': theme.palette.success.main,
        '--w-rjv-type-string-color': theme.palette.success.main,
        '--w-rjv-type-int-color': theme.palette.warning.main,
        '--w-rjv-type-float-color': theme.palette.success.main,
        '--w-rjv-type-bigint-color': theme.palette.warning.main,
        '--w-rjv-type-boolean-color': theme.palette.warning.main,
        '--w-rjv-type-date-color': theme.palette.text.secondary,
        '--w-rjv-type-null-color': theme.palette.error.main,
        '--w-rjv-type-nan-color': theme.palette.error.main,
        '--w-rjv-type-undefined-color': theme.palette.error.main,
      };
    },
    getColorspace: (theme) => {
      return {
        base02: theme.palette.mode === 'dark' ? neutral[700] : neutral[200],
        base08: theme.palette.error.main,
        base09: theme.palette.success.main,
        base0B: theme.palette.success.main,
        base0E: theme.palette.warning.main,
        base0F: theme.palette.warning.main,
        comment: theme.palette.text.secondary,
      };
    },
  },
  dialog: {
    getStyle: (theme) => {
      const isDark = theme.palette.mode === 'dark';
      return {
        fontSize: '0.75rem',
        lineHeight: '150%',
        '--w-rjv-background-color': theme.palette.background.paperElevation1,
        '--w-rjv-color': theme.palette.text.primary,
        '--w-rjv-key-string': theme.palette.text.primary,
        '--w-rjv-key-number': theme.palette.text.secondary,
        '--w-rjv-info-color': isDark ? neutral[500] : neutral[400],
        '--w-rjv-arrow-color': isDark ? neutral[500] : neutral[400],
        '--w-rjv-line-color': isDark ? `${neutral[700]}80` : `${neutral[200]}80`,
        '--w-rjv-curlybraces-color': isDark ? theme.palette.warning.main : neutral[600],
        '--w-rjv-brackets-color': isDark ? theme.palette.warning.main : neutral[600],
        '--w-rjv-colon-color': theme.palette.text.primary,
        '--w-rjv-quotes-color': theme.palette.text.primary,
        '--w-rjv-quotes-string-color': isDark ? amber[300] : red[700],
        '--w-rjv-ellipsis-color': isDark ? amber[300] : red[700],
        '--w-rjv-type-string-color': isDark ? amber[300] : red[700],
        '--w-rjv-type-int-color': isDark ? blue[300] : blue[600],
        '--w-rjv-type-float-color': isDark ? amber[400] : green[700],
        '--w-rjv-type-bigint-color': isDark ? blue[300] : blue[600],
        '--w-rjv-type-boolean-color': isDark ? blue[300] : blue[700],
        '--w-rjv-type-date-color': isDark ? neutral[500] : neutral[600],
        '--w-rjv-type-null-color': isDark ? theme.palette.error.main : red[400],
        '--w-rjv-type-nan-color': theme.palette.error.main,
        '--w-rjv-type-undefined-color': isDark ? theme.palette.error.main : neutral[500],
      };
    },
    getColorspace: () => ({}),
  },
};

/**
 * Creates a custom JsonView theme that integrates with the app's theme system.
 * Returns a CSS custom property style object for @uiw/react-json-view and
 * an optional colorspace subset for custom value renderers.
 *
 * @param {Object} theme - MUI theme object
 * @param {string} themeName - Name of the JsonView theme to use (default: 'qdrant-custom')
 * @return {{ style: Object, colorspace: Object }}
 */
export const createJsonViewerTheme = (theme, themeName = 'qdrant-custom') => {
  const selectedTheme = THEMES[themeName] || THEMES['qdrant-custom'];

  return {
    style: selectedTheme.getStyle(theme),
    colorspace: selectedTheme.getColorspace(theme),
  };
};

/**
 * Hook to get the current JsonView theme based on app theme.
 *
 * @param {string} themeName - Name of the JsonView theme to use (default: 'qdrant-custom')
 * @return {{ style: Object, colorspace: Object }}
 */
export const useJsonViewerTheme = (themeName = 'qdrant-custom') => {
  const theme = useTheme();
  return createJsonViewerTheme(theme, themeName);
};
