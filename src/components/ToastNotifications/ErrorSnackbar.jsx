import React, { forwardRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Box, Link } from '@mui/material';
import { MaterialDesignContent, closeSnackbar } from 'notistack';
import { extractJsonFromMessage } from '../../lib/extract-json-from-message';
import { showErrorDetails } from './error-details-store';

/**
 * Error variant for notistack. When the message contains JSON, shows only the text part
 * and a "More info" link that opens the formatted JSON in a dialog.
 */
export const ErrorSnackbar = forwardRef(function ErrorSnackbar(props, ref) {
  const { id, message, action } = props;
  const extracted = useMemo(() => extractJsonFromMessage(message), [message]);

  if (!extracted) {
    return <MaterialDesignContent ref={ref} {...props} />;
  }

  const shortMessage = [extracted.prefix, extracted.suffix].filter(Boolean).join(' ') || 'Request failed';
  const originalAction = typeof action === 'function' ? action(id) : action;

  const handleMoreInfo = () => {
    showErrorDetails(message);
    closeSnackbar(id);
  };

  return (
    <MaterialDesignContent
      ref={ref}
      {...props}
      message={shortMessage}
      action={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Link
            component="button"
            type="button"
            color="inherit"
            underline="always"
            onClick={handleMoreInfo}
            // snackbars render outside the MUI theme, so the MuiLink override doesn't reach them
            sx={{ textDecorationThickness: '1px', textUnderlineOffset: '2px' }}
          >
            More info
          </Link>
          {originalAction}
        </Box>
      }
    />
  );
});

ErrorSnackbar.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  message: PropTypes.node,
  action: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
};

export default ErrorSnackbar;
