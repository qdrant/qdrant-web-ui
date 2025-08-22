import React from 'react';
import PropTypes from 'prop-types';
import { IconButton, Tooltip } from '@mui/material';
import { ContentCopy } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { getSnackbarOptions } from './utils/snackbarOptions';

export const CopyButton = ({
  text,
  tooltip = 'Copy to clipboard',
  tooltipPlacement = 'left',
  successMessage = 'Copied to clipboard',
}) => {
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
        <ContentCopy />
      </IconButton>
    </Tooltip>
  );
};

CopyButton.propTypes = {
  text: PropTypes.string.isRequired,
  tooltip: PropTypes.string,
  tooltipPlacement: PropTypes.string,
  successMessage: PropTypes.string,
};
