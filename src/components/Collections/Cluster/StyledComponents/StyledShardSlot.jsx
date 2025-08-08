import { lighten, styled } from '@mui/material/styles';

// todo: move colors to theme
export const StyledShardSlot = styled('div')(({ theme, state, sx }) => {
  let color;
  switch (state) {
    case 'active':
      color = '#26A69A';
      break;
    case 'dead':
      color = '#e02828';
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
