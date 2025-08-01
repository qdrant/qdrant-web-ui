import { styled } from '@mui/material/styles';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import React from 'react';

export const StyledTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.mode === 'dark' ? '#0B0F19' : '#FCFDFF', // todo: take from theme
    color: theme.palette.mode === 'dark' ? '#FCFDFF' : '#0B0F19', // todo: take from theme
    boxShadow: theme.shadows[5],
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.palette.mode === 'dark' ? '#0B0F19' : '#FCFDFF', // todo: take from theme
  },
}));

