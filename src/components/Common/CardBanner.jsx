import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Button } from '@mui/material';
import { styled, alpha } from '@mui/material/styles';

const imgConsole = '/assets/console.svg';

const BannerContainer = styled(Box)`
  background-color: #f7f8fa;
  border-radius: 8px;
  position: relative;
  ${({ theme }) => `border: 1px solid ${alpha(theme.palette.divider, 0.12)}`};
  overflow: hidden;
`;

const GradientOverlay = styled(Box)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: radial-gradient(circle at 0% 100%, #304ffeff 0%, transparent 20%),
    radial-gradient(circle at 100% 0%, #304ffeff 0%, transparent 20%);
  opacity: 0.5;
  filter: blur(133px);
  pointer-events: none;
  z-index: 1;
`;

const ContentContainer = styled(Box)`
  display: flex;
  justify-content: flex-start;
  padding: 0 24px 0 0;
`;

const ContentSection = styled(Box)`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 24px;
  z-index: 4;
  flex-grow: 1;
  align-items: flex-start;
`;

const TextSection = styled(Box)`
  display: flex;
  flex-direction: column;
  max-width: 480px;
`;

const ConsoleIllustration = styled(Box)`
  height: 100%;
  width: 400px;
  z-index: 3;
  flex-shrink: 0;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CardBanner = ({ title, description, buttonText, buttonHref }) => {
  return (
    <BannerContainer>
      <GradientOverlay />
      <ContentContainer>
        <ContentSection>
          <TextSection>
            <Typography
              variant="h5"
              sx={{
                color: '#111824',
                fontSize: '24px',
                fontWeight: 600,
                lineHeight: 1.3,
                margin: 0,
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: '#656b7f',
                margin: 0,
              }}
            >
              {description}
            </Typography>
          </TextSection>

          <Button
            variant="contained"
            sx={{
              flexGrow: 0,
            }}
            href={buttonHref}
          >
            {buttonText}
          </Button>
        </ContentSection>

        <ConsoleIllustration>
          <img src={imgConsole} alt="Console illustration" style={{ width: '100%', height: 'auto' }} />
        </ConsoleIllustration>
      </ContentContainer>
    </BannerContainer>
  );
};

CardBanner.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  buttonText: PropTypes.string.isRequired,
  buttonHref: PropTypes.string.isRequired,
};

export default CardBanner;
