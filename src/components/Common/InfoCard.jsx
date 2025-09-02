import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';

const StyledCard = styled(Card)`
  background-color: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 8px;
  box-shadow: none;
`;

const StyledCardContent = styled(CardContent)`
  padding: 24px;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const IconContainer = styled(Box)`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
`;

const IconWrapper = styled(Box)`
  padding: 16px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const ContentWrapper = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 0;
`;

const StyledTitle = styled(Typography)`
  font-weight: 500;
  font-size: 16px;
  line-height: 1.5;
  // color: ${({ theme }) => theme.palette.text.primary};
`;

const StyledDescription = styled(Typography)`
  font-weight: 400;
  font-size: 14px;
  line-height: 1.5;
  color: ${({ theme }) => theme.palette.text.secondary};
`;

const InfoCard = ({ icon: Icon, title, description, iconColor }) => {
  const theme = useTheme();
  const displayIconColor = iconColor || theme.palette.info.main;

  return (
    <StyledCard>
      <StyledCardContent>
        <IconContainer>
          <IconWrapper>
            <Icon size="20px" color={displayIconColor} />
          </IconWrapper>
          <ContentWrapper>
            <StyledTitle component="h3">{title}</StyledTitle>
            <StyledDescription component="p">{description}</StyledDescription>
          </ContentWrapper>
        </IconContainer>
      </StyledCardContent>
    </StyledCard>
  );
};

InfoCard.propTypes = {
  icon: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  iconColor: PropTypes.string,
};

export default InfoCard;
