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
        px: 3,
        py: 6,
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
