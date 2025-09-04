import React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';

export const CenteredFrame = ({ children }) => {
  return (
    <Box
      component="main"
      sx={{
        display: 'flex',
        justifyContent: 'center',
        maxWidth: '1120px',
        p: 5,
        margin: 'auto',
      }}
    >
      {children}
    </Box>
  );
};

// props validation
CenteredFrame.propTypes = {
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.node])), PropTypes.node]),
};
