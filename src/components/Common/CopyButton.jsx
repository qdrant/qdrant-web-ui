import React from 'react';
import PropTypes from 'prop-types';
import { IconButton, Tooltip } from '@mui/material';
import { CopyAll } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { getSnackbarOptions } from './utils/snackbarOptions';

export const CopyButton = ({ text, tooltip, tooltipPlacement, successMessage }) => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const successSnackbarOptions = getSnackbarOptions('success', closeSnackbar, 1000);
  const errorSnackbarOptions = getSnackbarOptions('error', closeSnackbar);

  return (
    <Tooltip title={tooltip} placement={tooltipPlacement}>
      <IconButton
        aria-label={tooltip}
        onClick={() => {
          navigator.clipboard
            .writeText(text)
            .then(() => {
              enqueueSnackbar(successMessage, successSnackbarOptions);
            })
            .catch((err) => {
              enqueueSnackbar(err.message, errorSnackbarOptions);
            });
        }}
      >
        <CopyAll />
      </IconButton>
    </Tooltip>
  );
};

CopyButton.defaultProps = {
  tooltip: 'Copy to clipboard',
  tooltipPlacement: 'left',
  successMessage: 'Copied to clipboard',
};

CopyButton.propTypes = {
  text: PropTypes.string.isRequired,
  tooltip: PropTypes.string,
  tooltipPlacement: PropTypes.string,
  successMessage: PropTypes.string,
};
