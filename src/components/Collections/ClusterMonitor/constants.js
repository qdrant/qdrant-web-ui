import { lighten } from '@mui/material/styles';
import { teal, red, orange, neutral } from '../../../theme/colors';

export const CLUSTER_COLORS = {
  active: teal['500'],
  dead: red['500'],
  empty: {
    dark: neutral['800'],
    light: neutral['100'],
  },
  default: orange['400'],
  textColor: (bgColor) => lighten(bgColor, 0.8),
};

export const getHighContrastClusterColors = (theme) => ({
  active: theme.palette.success.dark,
  dead: theme.palette.error.light,
  empty: {
    dark: theme.palette.background.paper,
    light: theme.palette.background.paper,
  },
  default: theme.palette.common.white,
  textColor: (bgColor) => theme.palette.getContrastText(bgColor),
});

export const TOOLTIP_COLORS = {
  background: {
    dark: neutral['800'],
    light: neutral['100'],
  },
  text: {
    dark: neutral['100'],
    light: neutral['800'],
  },
};
