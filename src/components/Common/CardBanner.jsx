import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Button } from '@mui/material';
import { styled, alpha, useTheme } from '@mui/material/styles';
import { indigo } from '@mui/material/colors';
import { Link } from 'react-router';

// Side by side, the illustration keeps its full size and is cropped on the
// right when space runs out; below this width it moves under the text.
const WIDE_QUERY = '@container cardBanner (min-width: 600px)';
// On middle widths the text wraps into a taller block, so the illustration is
// enlarged to match its height (and cropped further on the right).
const MIDDLE_QUERY = '@container cardBanner (min-width: 600px) and (max-width: 959px)';

const BannerContainer = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: 8,
  position: 'relative',
  border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
  overflow: 'hidden',
  containerType: 'inline-size',
  containerName: 'cardBanner',
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

const ContentContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  [WIDE_QUERY]: {
    flexDirection: 'row',
  },
});

const ContentSection = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  padding: '1.5rem',
  flex: '1 1 auto',
  minWidth: 0,
  [WIDE_QUERY]: {
    flex: '1 0 18rem',
  },
});

const TextSection = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
  maxWidth: '30rem',
});

const ConsoleIllustration = styled(Box)({
  zIndex: 3,
  display: 'flex',
  padding: '0 1.5rem',
  [WIDE_QUERY]: {
    alignSelf: 'flex-end',
    flex: '0 0 25rem',
    paddingLeft: 0,
    paddingTop: '1.5rem',
  },
  [MIDDLE_QUERY]: {
    flexBasis: '32rem',
  },
});

const CardBanner = ({ title, description, buttonText, linkTo, imgSrc }) => {
  const theme = useTheme();

  const isExternalLink = linkTo.startsWith('http:');

  const onClick = () => {
    if (!isExternalLink) {
      window.scrollTo(0, 0);
    }
  };

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
            component={Link}
            to={linkTo}
            target={isExternalLink ? '_blank' : undefined}
            onClick={onClick}
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
  linkTo: PropTypes.string.isRequired,
  imgSrc: PropTypes.string.isRequired,
};

export default CardBanner;
