import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@mui/material';
import { Copy } from 'lucide-react';
import { BaseCopyComponent } from './BaseCopyComponent';

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

  const renderButton = ({ handleCopy }) => (
    <Button
      variant="text"
      onClick={handleCopy}
      sx={{
        color: 'text.primary',
        gap: 1,
        lineHeight: 1.5,
        border: 'none',
      }}
      {...buttonProps}
    >
      {renderContent()}
    </Button>
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
