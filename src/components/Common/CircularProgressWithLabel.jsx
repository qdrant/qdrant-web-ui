import * as React from 'react';
import PropTypes from 'prop-types';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

function CircularProgressWithLabel({ value, size = 40, sx = {}, circularProgressProps = {}, ...props }) {
  return (
    <Box
      sx={{
        position: 'relative',
        display: 'inline-flex',
        width: size,
        height: size,
        ...sx,
      }}
      {...props}
    >
      <CircularProgress
        variant="determinate"
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          marginTop: `-${size / 2}px`,
          marginLeft: `-${size / 2}px`,
          ...circularProgressProps.sx,
        }}
        size={size}
        value={value}
        {...circularProgressProps}
      />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="caption" component="div" color="text.secondary">
          {`${Math.round(value)}%`}
        </Typography>
      </Box>
    </Box>
  );
}

CircularProgressWithLabel.propTypes = {
  value: PropTypes.number.isRequired,
  size: PropTypes.number,
  sx: PropTypes.object,
  circularProgressProps: PropTypes.object,
};

export default CircularProgressWithLabel;
