import React from 'react';
import PropTypes from 'prop-types';
import { Alert, IconButton, Typography, useTheme } from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { Sparkles, X } from 'lucide-react';

const AnnouncementBannerStyled = styled(Alert)`
  background-color: ${({ theme }) => alpha(theme.palette.primary.main, 0.12)};
  border-radius: 0.5rem;
  padding: 1rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;

  .MuiAlert-icon {
    width: 1.875rem;
    height: 1.875rem;
    margin: 0;
  }

  .MuiAlert-message {
    flex: 1;
    padding: 0;
    margin: 0;
  }

  .MuiAlert-action {
    padding: 0;
    margin: 0;
  }
`;

const BannerText = styled(Typography)`
  font-size: 1rem;
  line-height: 1.5;
  color: ${({ theme }) => theme.palette.text.primary};
`;

const CloseButton = styled(IconButton)`
  width: 1.875rem;
  height: 1.875rem;
  padding: 0.3125rem;
  border-radius: 50%;

  &:hover {
    background-color: ${({ theme }) => theme.palette.action.hover};
  }
`;

const AnnouncementBanner = ({ children, icon, onClose, show = true }) => {
  const theme = useTheme();
  if (!show) return null;

  const defaultIcon = <Sparkles size={20} color={theme.palette.primary.main} />;
  const displayIcon = icon || defaultIcon;

  return (
    <AnnouncementBannerStyled
      icon={displayIcon}
      action={
        <CloseButton onClick={onClose} size="small">
          <X size={20} />
        </CloseButton>
      }
    >
      <BannerText>{children}</BannerText>
    </AnnouncementBannerStyled>
  );
};

AnnouncementBanner.propTypes = {
  children: PropTypes.node.isRequired,
  icon: PropTypes.node,
  onClose: PropTypes.func.isRequired,
  show: PropTypes.bool,
};

export default AnnouncementBanner;
