import { styled } from '@mui/material/styles';
import { ButtonGroup } from '@mui/material';
import { alpha } from '@mui/material/styles';

export const StyledButtonGroup = styled(ButtonGroup)(({ theme }) => ({
  borderRadius: '0.5rem',
  border: `1px solid ${theme.palette.divider}`,

  '& .MuiButton-root': {
    padding: '0.75rem 2.5rem',
    borderLeft: 'none',
    borderTop: 'none',
    borderBottom: 'none',
    borderRight: 'none',

    '&.MuiButton-outlined': {
      color: theme.palette.text.primary,

      '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.04),
      },
    },

    '&.MuiButton-contained': {
      color: theme.palette.primary.main,
      backgroundColor: alpha(theme.palette.primary.main, 0.08),

      '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.12),
      },
    },
  },
}));

export default StyledButtonGroup;
