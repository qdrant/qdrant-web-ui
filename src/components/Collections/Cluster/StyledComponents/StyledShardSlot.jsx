import { lighten, styled, alpha } from '@mui/material/styles';
import { CLUSTER_COLORS, CLUSTER_STYLES } from '../constants';

export const StyledShardSlot = styled('div')(({ theme, state, dragAndDropState, sx }) => {
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

  const dragAndDropStyles = {};
  switch (dragAndDropState) {
    case 'grabbed':
      dragAndDropStyles.cursor = 'grabbing';
      dragAndDropStyles.transform = 'scale(1.05)';
      dragAndDropStyles.zIndex = 1000;
      dragAndDropStyles.opacity = 0.6;
      dragAndDropStyles.filter = 'grayscale(0.3)';
      break;
    case 'awaiting':
      dragAndDropStyles.border = CLUSTER_STYLES.dragAndDrop.awaiting.border;
      dragAndDropStyles.backgroundColor = alpha(color, 0.8);
      dragAndDropStyles.cursor = 'copy';
      dragAndDropStyles['&:hover'] = {
        transform: 'scale(1.06)',
        backgroundColor: alpha(CLUSTER_COLORS.active, 0.7),
      };

      break;
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
    transition: 'all 0.2s ease-in-out',
    userSelect: 'none',
    cursor: state === 'active' ? 'grab' : 'default',
    '& .MuiTypography-root': {
      color: lighten(color, 0.8),
      position: 'relative',
      margin: '0 auto',
      zIndex: 1,
    },
    '&:hover': {
      transform: dragAndDropState === 'grabbed' ? 'scale(1.05)' : 'scale(1.02)',
    },
    ...dragAndDropStyles,
    ...sx,
  };
});
