import React, { Fragment, useState } from 'react';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import Slide from '@mui/material/Slide';
import PropTypes from 'prop-types';

const Alert = React.forwardRef((props, ref) => {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});
Alert.displayName = 'Alert';

function SlideTransition(props) {
  return <Slide {...props} direction="down" />;
}

export default function SuccessNotifier({ message, setIsSuccess }) {
  const [open, setOpen] = useState(true);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setIsSuccess(false);
    setOpen(false);
  };

  return (
    <>
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        TransitionComponent={SlideTransition}
      >
        <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
          {message}
        </Alert>
      </Snackbar>
    </>
  );
}
SuccessNotifier.propTypes = {
  message: PropTypes.string,
  setIsSuccess: PropTypes.func,
};
