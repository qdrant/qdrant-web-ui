import React from 'react';
import PropTypes from 'prop-types';
import Container from '@mui/material/Container';

export const CenteredFrame = ({ children, maxWidth = 'lg' }) => {
  return (
    <Container
      maxWidth={maxWidth}
      component="main"
      sx={{
        display: 'flex',
        justifyContent: 'center',
        // maxWidth: '1120px',
        p: 5,
        margin: 'auto',
      }}
    >
      {children}
    </Container>
  );
};

// props validation
CenteredFrame.propTypes = {
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.node])), PropTypes.node]),
  maxWidth: PropTypes.string,
};
