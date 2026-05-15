import React, { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { getSnackbarOptions } from '../Common/utils/snackbarOptions';

const MAX_MESSAGE_LENGTH = 250;

const truncateMessage = (msg) => {
  if (msg && msg.length > MAX_MESSAGE_LENGTH) {
    return msg.substring(0, MAX_MESSAGE_LENGTH - 3) + '...';
  }
  return msg;
};

export const ErrorNotifier = ({ message = 'Something went wrong', callback }) => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const errorSnackbarOptions = getSnackbarOptions('error', closeSnackbar, 6000);

  const truncatedMessage = useMemo(() => truncateMessage(message), [message]);

  useEffect(() => {
    enqueueSnackbar(truncatedMessage, errorSnackbarOptions);
    typeof callback === 'function' && callback();
  }, [enqueueSnackbar, errorSnackbarOptions, truncatedMessage]);

  return null;
};

ErrorNotifier.propTypes = {
  message: PropTypes.string,
  callback: PropTypes.func,
};

export default ErrorNotifier;
