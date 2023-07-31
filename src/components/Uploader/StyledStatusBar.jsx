import React from 'react';
import StatusBar from '@uppy/react/lib/StatusBar';
import { styled } from '@mui/material/styles';

export const StyledStatusBar = styled(StatusBar)(({ theme }) => ({
  '& .uppy-StatusBar': {
    backgroundColor: theme.palette.background.paper,
  },
}));
