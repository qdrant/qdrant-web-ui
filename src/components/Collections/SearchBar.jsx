import React from 'react';
import PropTypes from 'prop-types';
import { Box, InputAdornment, OutlinedInput } from '@mui/material';
import { Search } from 'lucide-react';
import { alpha, useTheme } from '@mui/material/styles';

function InputWithIcon({ value, setValue, actions }) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <OutlinedInput
        fullWidth
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search Collection"
        startAdornment={
          <InputAdornment position="start">
            <Search size={20} color={theme.palette.text.primary} />
          </InputAdornment>
        }
        sx={{
          borderRadius: '8px',
          '& .MuiOutlinedInput-input': {
            padding: '0.5rem',
            fontSize: '1rem',
            fontWeight: 400,
            height: '1.5rem',
            lineHeight: '1.5rem',
            color: theme.palette.text.primary,
            '&::placeholder': {
              color: theme.palette.text.disabled,
              opacity: 1,
            },
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: alpha(theme.palette.divider, 0.23),
          },
        }}
      />

      {/* additional actions */}
      {actions?.length && actions.map((action, index) => <React.Fragment key={index}>{action}</React.Fragment>)}
    </Box>
  );
}
InputWithIcon.propTypes = {
  value: PropTypes.string,
  setValue: PropTypes.func,
  actions: PropTypes.arrayOf(PropTypes.element),
};

export default InputWithIcon;
