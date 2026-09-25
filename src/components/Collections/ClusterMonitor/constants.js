import { lighten } from '@mui/material/styles';
import { teal, red, orange, neutral, primary } from '../../../theme/colors';

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

/**
 * Colors of the shard transfer arrows (and their progress markers). In the dark
 * theme no single color stands out on both the light orange and the dark empty
 * slots (even white is below 2:1 on orange), so the light arrows get a dark halo,
 * the way lines on maps are cased.
 * @param {object} theme MUI theme
 * @return {{stroke: string, halo: ?string}}
 */
export const getTransferArrowColors = (theme) => {
  if (theme.palette.mode === 'dark' && !theme.palette.highContrast) {
    return { stroke: primary['200'], halo: neutral['950'] };
  }
  return {
    stroke: theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.main,
    halo: null,
  };
};
