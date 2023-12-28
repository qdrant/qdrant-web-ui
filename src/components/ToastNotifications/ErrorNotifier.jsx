import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { getSnackbarOptions } from '../Common/utils/snackbarOptions';

export const ErrorNotifier = ({ message = 'Something went wrong', callback }) => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const errorSnackbarOptions = getSnackbarOptions('error', closeSnackbar, 6000);

  useEffect(() => {
    enqueueSnackbar(message, errorSnackbarOptions);
    typeof callback === 'function' && callback();
  }, [enqueueSnackbar, errorSnackbarOptions, message]);

  return null;
};

ErrorNotifier.propTypes = {
  message: PropTypes.string,
  callback: PropTypes.func,
};

export default ErrorNotifier;
