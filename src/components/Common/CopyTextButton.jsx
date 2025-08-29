import React from 'react';
import PropTypes from 'prop-types';
import { Button, Tooltip } from '@mui/material';
import { Copy } from 'lucide-react';
import { useSnackbar } from 'notistack';
import { getSnackbarOptions } from './utils/snackbarOptions';

export const CopyTextButton = ({
  text,
  tooltip = 'Copy to clipboard',
  tooltipPlacement = 'left',
  successMessage = 'Copied to clipboard',
  size,
  buttonProps,
  showIcon = true,
  iconPosition = 'start', // 'start' or 'end'
  children = 'Copy',
}) => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const successSnackbarOptions = getSnackbarOptions('success', closeSnackbar, 1000);
  const errorSnackbarOptions = getSnackbarOptions('error', closeSnackbar);

  const handleCopy = () => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        enqueueSnackbar(successMessage, successSnackbarOptions);
      })
      .catch((err) => {
        enqueueSnackbar(err.message, errorSnackbarOptions);
      });
  };

  const renderIcon = () => {
    if (!showIcon) return null;
    return <Copy size={size || '1.25rem'} />;
  };

  const renderContent = () => {
    if (iconPosition === 'start') {
      return (
        <>
          {renderIcon()}
          {children}
        </>
      );
    }
    // default: icon at end
    return (
      <>
        {children}
        {renderIcon()}
      </>
    );
  };

  return (
    <Tooltip title={tooltip} placement={tooltipPlacement}>
      <Button
        variant="text"
        onClick={handleCopy}
        sx={{
          color: 'text.primary',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          textTransform: 'capitalize',
          fontFeatureSettings: "'ss01' on, 'ss05' on, 'ss06' on",
          fontSize: '13px',
          fontStyle: 'normal',
          fontWeight: 500,
          lineHeight: 1.5,
        }}
        {...buttonProps}
      >
        {renderContent()}
      </Button>
    </Tooltip>
  );
};

CopyTextButton.propTypes = {
  text: PropTypes.string.isRequired,
  tooltip: PropTypes.string,
  tooltipPlacement: PropTypes.string,
  successMessage: PropTypes.string,
  size: PropTypes.string,
  buttonProps: PropTypes.object,
  showIcon: PropTypes.bool,
  iconPosition: PropTypes.oneOf(['start', 'end']),
  children: PropTypes.node,
};
