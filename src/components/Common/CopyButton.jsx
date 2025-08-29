import React from 'react';
import PropTypes from 'prop-types';
import { IconButton } from '@mui/material';
import { Copy } from 'lucide-react';
import { BaseCopyComponent } from './BaseCopyComponent';

export const CopyButton = ({
  text,
  tooltip = 'Copy to clipboard',
  tooltipPlacement = 'left',
  successMessage = 'Copied to clipboard',
  size,
  iconButtonProps,
}) => {
  const renderButton = ({ handleCopy }) => (
    <IconButton
      sx={{
        color: 'text.primary',
      }}
      aria-label={tooltip}
      onClick={handleCopy}
      {...iconButtonProps}
    >
      <Copy size={size || '1.25rem'} />
    </IconButton>
  );

  return (
    <BaseCopyComponent
      text={text}
      tooltip={tooltip}
      tooltipPlacement={tooltipPlacement}
      successMessage={successMessage}
      renderButton={renderButton}
    />
  );
};

CopyButton.propTypes = {
  text: PropTypes.string.isRequired,
  tooltip: PropTypes.string,
  tooltipPlacement: PropTypes.string,
  successMessage: PropTypes.string,
  size: PropTypes.string,
  iconButtonProps: PropTypes.object,
};
