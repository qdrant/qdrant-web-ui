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

export const CLUSTER_STYLES = {
  dragAndDrop: {
    awaiting: {
      border: '1px dashed #fff',
    },
  },
};
