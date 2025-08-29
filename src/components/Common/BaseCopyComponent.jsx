import React from 'react';
import PropTypes from 'prop-types';
import { Tooltip } from '@mui/material';
import { useCopyToClipboard } from './hooks/useCopyToClipboard';

export const BaseCopyComponent = ({
  text,
  tooltip = 'Copy to clipboard',
  tooltipPlacement = 'left',
  successMessage = 'Copied to clipboard',
  renderButton,
}) => {
  const { copyToClipboard } = useCopyToClipboard({ successMessage });

  const handleCopy = () => {
    copyToClipboard(text);
  };

  const buttonElement = renderButton({ handleCopy });

  return (
    <Tooltip title={tooltip} placement={tooltipPlacement}>
      {buttonElement}
    </Tooltip>
  );
};

BaseCopyComponent.propTypes = {
  text: PropTypes.string.isRequired,
  tooltip: PropTypes.string,
  tooltipPlacement: PropTypes.string,
  successMessage: PropTypes.string,
  renderButton: PropTypes.func.isRequired,
};
