import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Button } from '@mui/material';
import { styled, alpha, useTheme } from '@mui/material/styles';
import { indigo } from '@mui/material/colors';

const BannerContainer = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: 8,
  position: 'relative',
  border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
  overflow: 'hidden',
}));

const GradientOverlay = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundImage:
    `radial-gradient(circle at 0% 150%, ${indigo[500]} 0%, transparent 40%),` +
    `radial-gradient(circle at 100% 0%, ${indigo[500]} 0%, transparent 40%)`,
  opacity: 0.6,
  filter: 'blur(8.3125rem)',
  pointerEvents: 'none',
  zIndex: 1,
});

const ContentContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  [theme.breakpoints.up('md')]: {
    flexWrap: 'nowrap',
  },
}));

const ContentSection = styled(Box)(({ theme }) => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  padding: '1.5rem',
  flexGrow: 1,
  alignItems: 'flex-start',
  [theme.breakpoints.up('md')]: {
    maxWidth: '64%',
  },
}));

const TextSection = styled(Box)(({ theme }) => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  [theme.breakpoints.up('md')]: {
    maxWidth: '30rem',
  },
}));

const ConsoleIllustration = styled(Box)(({ theme }) => ({
  height: '100%',
  zIndex: 3,
  flexShrink: 0,
  display: 'flex',
  alignSelf: 'flex-end',
  paddingRight: '1.5rem',
  [theme.breakpoints.up('md')]: {
    maxWidth: '25rem',
  },
}));

const CardBanner = ({ title, description, buttonText, buttonHref, imgSrc }) => {
  const theme = useTheme();

  return (
    <BannerContainer>
      <GradientOverlay />
      <ContentContainer>
        <ContentSection>
          <TextSection>
            <Typography
              variant="h5"
              sx={{
                color: theme.palette.text.primary,
                fontSize: '1.5rem',
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
                color: theme.palette.text.secondary,
                margin: 0,
              }}
            >
              {description}
            </Typography>
          </TextSection>

          <Button
            variant="contained"
            href={buttonHref}
            sx={{
              mt: 2,
            }}
          >
            {buttonText}
          </Button>
        </ContentSection>

        <ConsoleIllustration>
          <img src={imgSrc} alt={title} style={{ width: '100%', height: 'auto' }} />
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
  imgSrc: PropTypes.string.isRequired,
};

export default CardBanner;
