import { teal, red, orange, neutral } from '../../../theme/colors';

export const CLUSTER_COLORS = {
  active: teal['500'],
  dead: red['500'],
  empty: {
    dark: neutral['800'],
    light: neutral['100'],
  },
  default: orange['400'],
};

export const HIGH_CONTRAST_CLUSTER_COLORS = {
  active: '#00E5FF',
  dead: '#FF9100',
  empty: {
    dark: '#1a1a1a',
    light: '#1a1a1a',
  },
  default: '#808080',
};

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
