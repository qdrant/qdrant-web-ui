import React from 'react';
import { styled } from '@mui/material/styles';
import MuiAccordion from '@mui/material/Accordion';
import MuiAccordionSummary from '@mui/material/AccordionSummary';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import { ArrowForwardIosSharp } from '@mui/icons-material';

export const Accordion = styled((props) => <MuiAccordion disableGutters elevation={0} square {...props} />)(() => ({
  padding: 0,
  backgroundColor: 'transparent',
  '&:not(:last-child)': {
    borderBottom: 0,
  },
  '&:before': {
    display: 'none',
  },
}));

export const AccordionSummary = styled((props) => (
  <MuiAccordionSummary expandIcon={<ArrowForwardIosSharp sx={{ fontSize: '0.9rem' }} />} {...props} />
))(({ theme }) => ({
  padding: 0,
  '& .MuiAccordionSummary-content': {
    margin: 0,
    '& > .MuiButtonBase-root:hover': {
      backgroundColor: 'transparent',
    },
  },
  '& .MuiAccordionSummary-expandIconWrapper': {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
  '&:hover': {
    backgroundColor: theme.palette.grey[100],
  },
}));

export const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: 0,
  borderTop: `1px solid ${theme.palette.divider}`,
}));
