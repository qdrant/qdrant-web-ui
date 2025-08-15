import React from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/system';

export const Circle = ({ color, size, sx }) => (
  <Box
    sx={{
      width: size,
      height: size,
      borderRadius: '50%',
      backgroundColor: color,
      display: 'inline-block',
      ...sx,
    }}
  />
);

// prop types
Circle.propTypes = {
  color: PropTypes.string.isRequired,
  size: PropTypes.string.isRequired,
  sx: PropTypes.object,
};
