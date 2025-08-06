import { lighten, styled } from '@mui/material/styles';

// todo: move colors to theme
export const StyledShardSlot = styled('div')(({ theme, state, sx }) => {
  let color;
  switch (state) {
    case 'active':
      color = '#26A69A';
      break;
    case 'dead':
      color = '#EC407A';
      break;
    case 'empty':
      if (theme.palette.mode === 'dark') {
        color = '#262B3A';
      } else {
        color = '#E2E7F5';
      }
      break;
    default:
      color = '#FFA726';
  }

  return {
    borderRadius: '2px', // todo: take from theme
    backgroundColor: color,
    height: '80px',
    width: 'auto',
    minWidth: '20px',
    position: 'relative',
    '& .MuiTypography-root': {
      color: lighten(color, 0.8),
      position: 'relative',
      margin: '0 auto',
      zIndex: 1,
    },
    ...sx,
  };
});
