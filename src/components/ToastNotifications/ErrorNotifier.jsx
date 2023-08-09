import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { getSnackbarOptions } from '../Common/utils/snackbarOptions';

export const ErrorNotifier = ({ message }) => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const errorSnackbarOptions = getSnackbarOptions('error', closeSnackbar, 6000);

  useEffect(() => {
    enqueueSnackbar(message, errorSnackbarOptions);
  }, [enqueueSnackbar, errorSnackbarOptions, message]);

  return null;
};

ErrorNotifier.defaultProps = {
  message: 'We are sorry, but something went wrong. Please, try again later.',
};

ErrorNotifier.propTypes = {
  message: PropTypes.string,
};

export default ErrorNotifier;
