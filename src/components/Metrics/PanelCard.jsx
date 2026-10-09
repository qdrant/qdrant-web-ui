import React from 'react';
import PropTypes from 'prop-types';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// Consistent titled card used by the preset dashboard panels.
function PanelCard({ title, subtitle, children }) {
  const theme = useTheme();
  return (
    <Card variant="outlined">
      <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Typography variant="subtitle1" fontWeight={600} noWrap>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary" noWrap component="div">
            {subtitle}
          </Typography>
        )}
      </Box>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

PanelCard.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  children: PropTypes.node,
};

export default PanelCard;
