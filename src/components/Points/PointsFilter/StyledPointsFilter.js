import { styled } from '@mui/material/styles';
import { Box, IconButton, Paper, Popper } from '@mui/material';
import Editor from 'react-simple-code-editor';
import { filterInputFontFamily } from './helpers';

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

export const getFilterInputFontSx = (theme) => ({
  fontFamily: filterInputFontFamily,
  fontSize: theme.typography.body1.fontSize,
  fontWeight: 400,
  lineHeight: '23px',
  letterSpacing: 'normal',
  fontFeatureSettings: 'normal',
  fontVariantLigatures: 'none',
});

export const StyledFilterEditor = styled(Editor)(({ theme }) => ({
  flex: 1,
  // Monospace avoids cumulative cursor drift from variable/proportional fonts in textarea vs pre
  ...getFilterInputFontSx(theme),
  '& textarea, & pre': {
    fontFamily: 'inherit !important',
    fontSize: 'inherit !important',
    fontWeight: 'inherit !important',
    lineHeight: 'inherit !important',
    letterSpacing: 'inherit !important',
    fontFeatureSettings: 'inherit !important',
    fontVariantLigatures: 'inherit !important',
    margin: '0 !important',
    padding: '0 !important',
    border: 'none !important',
    outline: 'none !important',
    background: 'transparent !important',
    whiteSpace: 'pre-wrap !important',
    // Match react-simple-code-editor defaults for consistent wrapping
    wordBreak: 'keep-all !important',
    overflowWrap: 'break-word !important',
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
  minWidth: 300,
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

export const getSharedTextFieldSx = (theme) => {
  const fontSx = getFilterInputFontSx(theme);

  return {
    '& .MuiOutlinedInput-root': {
      ...fontSx,
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
    '& .MuiOutlinedInput-input, & .MuiInputBase-input': {
      ...fontSx,
    },
    '& .MuiChip-root': {
      ...fontSx,
      height: 28,
      borderRadius: '8px',
    },
    '& .MuiChip-label': {
      ...fontSx,
    },
    '& .MuiOutlinedInput-input::placeholder': {
      color: theme.palette.text.disabled,
      opacity: 1,
      ...fontSx,
    },
  };
};
