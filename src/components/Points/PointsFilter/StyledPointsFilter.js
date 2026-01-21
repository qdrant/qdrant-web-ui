import { styled } from '@mui/material/styles';
import { Box, IconButton, Paper, Popper } from '@mui/material';
import Editor from 'react-simple-code-editor';

export const StyledAutocompletePopper = styled(Popper)(() => ({
  width: 'fit-content !important',
  maxWidth: '80vw',
  '& .MuiAutocomplete-paper': {
    maxHeight: 240,
  },
  '& .MuiAutocomplete-listbox': {
    maxHeight: 220,
  },
}));

export const FilterInputContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: '8px',
  minHeight: 40,
  padding: '6px 8px',
  transition: 'border-color 0.15s ease-in-out',
  cursor: 'text',
  '&:hover': {
    borderColor: theme.palette.text.primary,
  },
  '&:focus-within': {
    borderColor: theme.palette.primary.main,
    borderWidth: 2,
    padding: '5px 7px', // Compensate for thicker border
  },
}));

export const FilterIcon = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginRight: 4,
  color: theme.palette.text.secondary,
  flexShrink: 0,
}));

export const ClearButton = styled(IconButton)(({ theme }) => ({
  padding: '4px',
  marginLeft: '4px',
  marginRight: '-4px',
  color: theme.palette.action.active,
  flexShrink: 0,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    color: theme.palette.action.active,
  },
}));

export const StyledFilterEditor = styled(Editor)(({ theme }) => ({
  flex: 1,
  fontFamily: theme.typography.fontFamily,
  fontSize: '1rem',
  fontWeight: 400,
  lineHeight: '23px',
  letterSpacing: '0.5px',
  '& textarea, & pre': {
    fontFamily: 'inherit !important',
    fontSize: 'inherit !important',
    fontWeight: 'inherit !important',
    lineHeight: 'inherit !important',
    letterSpacing: 'inherit !important',
    margin: '0 !important',
    padding: '0 !important',
    border: 'none !important',
    outline: 'none !important',
    background: 'transparent !important',
    whiteSpace: 'pre-wrap !important',
    wordBreak: 'break-word !important',
    wordSpacing: 'normal !important',
    '&::placeholder': {
      color: theme.palette.text.disabled,
      opacity: 1,
      fontFamily: 'inherit !important',
      fontSize: 'inherit !important',
      fontWeight: 'inherit !important',
    },
  },
}));

export const FilterAutocompletePopper = styled(Popper)({
  zIndex: 1300,
});

export const AutocompleteList = styled(Paper)(({ theme }) => ({
  maxHeight: 220,
  minWidth: 300,
  overflow: 'auto',
  marginTop: 4,
  '& .MuiMenuItem-root': {
    fontFamily: 'monospace',
    fontSize: '0.8125rem',
    padding: '4px 12px',
    minHeight: 'auto',
    '&.Mui-selected': {
      backgroundColor: theme.palette.action.selected,
    },
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
}));

export const getSharedTextFieldSx = (theme) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    padding: '6px 8px',
    minHeight: 40,
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.divider,
  },
  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.primary.main,
  },
  '& .MuiChip-root': {
    height: 28,
    borderRadius: '8px',
  },
  '& .MuiOutlinedInput-input::placeholder': {
    color: theme.palette.text.disabled,
    opacity: 1,
  },
});
