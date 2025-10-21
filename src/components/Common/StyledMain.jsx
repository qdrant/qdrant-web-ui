import { styled } from '@mui/material/styles';

const StyledMain = styled('main')(({ theme }) => ({
  height: '100vh',

  scrollBehavior: 'smooth',
  scrollbarWidth: 'thin',

  '& *::-webkit-scrollbar': {
    width: '6px',
    height: '6px',
  },

  '& *::-webkit-scrollbar-track': {
    background: theme.palette.background.default,
  },

  '& *::-webkit-scrollbar-thumb': {
    background: theme.palette.nativeScrollbarBg,
    borderRadius: '6px',
  },
}));

export default StyledMain;
