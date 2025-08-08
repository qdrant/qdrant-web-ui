import { lighten, styled } from '@mui/material/styles';
import { CLUSTER_COLORS } from '../constants';

export const StyledShardSlot = styled('div')(({ theme, state, sx }) => {
  let color;
  switch (state) {
    case 'active':
      color = CLUSTER_COLORS.active;
      break;
    case 'dead':
      color = CLUSTER_COLORS.dead;
      break;
    case 'empty':
      color = theme.palette.mode === 'dark' ? CLUSTER_COLORS.empty.dark : CLUSTER_COLORS.empty.light;
      break;
    default:
      color = CLUSTER_COLORS.default;
  }

  return {
    borderRadius: 2,
    backgroundColor: color,
    minHeight: '32px',
    maxHeight: '80px',
    alignSelf: 'stretch',
    display: 'flex',
    flexDirection: 'column',
    aspectRatio: '11/16',
    width: '100%',
    minWidth: '22px',
    overflow: 'hidden',
    position: 'relative',
    padding: '4px 2px',
    '& .MuiTypography-root': {
      color: lighten(color, 0.8),
      position: 'relative',
      margin: '0 auto',
      zIndex: 1,
    },
    ...sx,
  };
});
