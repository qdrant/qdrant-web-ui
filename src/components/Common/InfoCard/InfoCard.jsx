import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Typography, Box, CardActions, CardActionArea, Button } from '@mui/material';
import { alpha, styled, useTheme } from '@mui/material/styles';
import { ChevronRight } from 'lucide-react';

const StyledCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  width: '100%',
  border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
  borderRadius: '0.5rem',
  boxShadow: 'none',
  '&:hover': {
    boxShadow: theme.shadows[8],
  },
}));

const StyledCardActionArea = styled(CardActionArea)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  flexGrow: 1,
  '&:hover': {
    ...(theme.palette.mode === 'light' && {
      '& .MuiCardActionArea-focusHighlight': {
        opacity: 0,
      },
    }),
  },
}));

const StyledCardContent = styled(CardContent)({
  width: '100%',
  padding: '1.5rem',
  display: 'flex',
  flexGrow: 1,
  '&.side': {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '0.75rem', // 12px
  },
  '&.top': {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
});

const IconWrapper = styled(Box)({
  border: '1px solid rgba(0, 0, 0, 0.12)', // divider color
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  '.side &': {
    padding: '1rem',
    border: '1px solid rgba(0, 0, 0, 0.12)', // divider color
    borderRadius: '8px',
  },
  '.top &': {
    border: 'none',
    marginBottom: '0.5rem',
  },
});

const ContentWrapper = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 0.375rem; // 6px
  flex: 1;
  min-width: 0;
`;

const StyledTitle = styled(Typography)`
  font-weight: 500;
  font-size: 1rem;
  line-height: 1.5;
`;

const StyledDescription = styled(Typography)`
  font-weight: 400;
  font-size: 0.875rem; // 14px
  line-height: 1.5;
  color: ${({ theme }) => theme.palette.text.secondary};
`;

const StyledCardActions = styled(CardActions)({
  width: '100%',
  padding: '0 1.5rem 1.5rem 1.25rem',
});

const StyledLink = styled((props) => <Button variant="text" {...props} />)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  color: theme.palette.text.primary,
  fontSize: '0.8125rem',
  textDecoration: 'none',
  fontWeight: 500,
  paddingLeft: '4px',
  paddingRight: 0,
  // add margin left if side icon with cta, to align with the icon
  '&.add-margin-left': {
    marginLeft: '4.375rem',
  },
  '&:hover': {
    '& svg': {
      color: theme.palette.primary.main,
    },
  },
}));

const InfoCard = ({ icon: Icon, iconVariant, title, description, iconColor, linkText, href, showCta = true, sx }) => {
  const theme = useTheme();
  const displayIconColor = iconColor || theme.palette.info.main;
  const displayIconVariant = iconVariant || 'side';
  const navigate = useNavigate();

  const handleClick = () => {
    if (!href) return;
    navigate(href);
  };

  const isSideIconWithCta = (iconVariant, withCta) => {
    return (!iconVariant || iconVariant === 'side') && withCta;
  };

  return (
    <StyledCard onClick={handleClick} role="button" sx={{...sx}}>
      <StyledCardActionArea>
        <StyledCardContent className={displayIconVariant}>
          <IconWrapper>
            <Icon size="20px" color={displayIconColor} />
          </IconWrapper>
          <ContentWrapper>
            <StyledTitle component="h3">{title}</StyledTitle>
            <StyledDescription component="p">{description}</StyledDescription>
          </ContentWrapper>
        </StyledCardContent>

        {showCta && href && (
          <StyledCardActions>
            <StyledLink
              component="a"
              onClick={handleClick}
              className={isSideIconWithCta(iconVariant, showCta) ? 'add-margin-left' : ''}
            >
              {linkText || 'Learn More'} <ChevronRight size="16px" />
            </StyledLink>
          </StyledCardActions>
        )}
      </StyledCardActionArea>
    </StyledCard>
  );
};

InfoCard.propTypes = {
  icon: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  iconColor: PropTypes.string,
  iconVariant: PropTypes.string, // 'side' or 'top'
  linkText: PropTypes.string,
  href: PropTypes.string.isRequired,
  showCta: PropTypes.bool,
  sx: PropTypes.object,
};

export default InfoCard;
