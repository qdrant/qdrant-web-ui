import React from 'react';
import PropTypes from 'prop-types';
import { Box, InputAdornment, OutlinedInput } from '@mui/material';
import { Search } from 'lucide-react';


function InputWithIcon({ value, setValue, actions }) {
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
            <Search size={20} color="rgba(17, 24, 36, 1)" />
          </InputAdornment>
        }
        sx={{ 
          borderRadius: '8px',
          '& .MuiOutlinedInput-input': {
          padding: '0.5rem',
            fontSize: '16px',
            fontWeight: 400,
            height: '24px',
            lineHeight: '24px',
            color: 'text.primary',
            '&::placeholder': {
              color: 'text.disabled',
              opacity: 1
            }
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(0, 0, 0, 0.23)'
          }
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
