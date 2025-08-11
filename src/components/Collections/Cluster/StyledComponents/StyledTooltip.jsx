import React from 'react';
import { styled } from '@mui/material/styles';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import { TOOLTIP_COLORS } from '../constants';

export const StyledTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.mode === 'dark' ? TOOLTIP_COLORS.background.dark : TOOLTIP_COLORS.background.light,
    color: theme.palette.mode === 'dark' ? TOOLTIP_COLORS.text.dark : TOOLTIP_COLORS.text.light,
    boxShadow: theme.shadows[5],
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.palette.mode === 'dark' ? TOOLTIP_COLORS.background.dark : TOOLTIP_COLORS.background.light,
  },
}));
