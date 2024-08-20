import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Alert, Box, Collapse } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

const InfoBanner = ({ severity, children, onClose }) => {
  const [open, setOpen] = useState(true);

  const handleClose = () => {
    onClose && onClose();
    setOpen(false);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Collapse in={open}>
        <Alert
          severity={severity}
          action={
            <IconButton aria-label="close" color="inherit" size="small" onClick={handleClose}>
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
          sx={{ my: 2, lineHeight: 1.7 }}
        >
          {children}
        </Alert>
      </Collapse>
    </Box>
  );
};

InfoBanner.propTypes = {
  severity: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  onClose: PropTypes.func,
};

export default InfoBanner;
