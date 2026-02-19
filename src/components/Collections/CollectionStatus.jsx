import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { Link } from 'react-router-dom';

const StatusBadge = styled(Box)(({ status, theme }) => {
  const getStatusStyles = (status) => {
    switch (status?.toLowerCase()) {
      case 'green':
        return {
          backgroundColor: alpha(theme.palette.success.main, 0.08),
          dotColor: theme.palette.success.main,
          textColor: theme.palette.success.main,
        };
      case 'yellow':
        return {
          backgroundColor: alpha(theme.palette.warning.main, 0.08),
          dotColor: theme.palette.warning.main,
          textColor: theme.palette.warning.main,
        };
      case 'grey':
        return {
          backgroundColor: alpha(theme.palette.text.secondary, 0.08),
          dotColor: theme.palette.text.secondary,
          textColor: theme.palette.text.secondary,
        };
      case 'red':
        return {
          backgroundColor: alpha(theme.palette.error.main, 0.08),
          dotColor: theme.palette.error.main,
          textColor: theme.palette.error.main,
        };
      default:
        return {
          backgroundColor: alpha(theme.palette.success.main, 0.08),
          dotColor: theme.palette.success.main,
          textColor: theme.palette.success.main,
        };
    }
  };

  const styles = getStatusStyles(status);

  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '2px 6px',
    borderRadius: '52px',
    backgroundColor: styles.backgroundColor,
    maxWidth: '170px',
    '& .status-dot': {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      backgroundColor: styles.dotColor,
      flexShrink: 0,
    },
    '& .status-text': {
      fontSize: '12px',
      fontWeight: 500,
      lineHeight: 1.5,
      color: styles.textColor,
      textTransform: 'uppercase',
    },
  };
});

const CollectionStatus = ({ status, collectionName }) => (
  <StatusBadge
    status={status}
    component={Link}
    to={`/collections/${encodeURIComponent(collectionName)}#info`}
    sx={{ textDecoration: 'none' }}
  >
    <div className="status-dot" />
    <Typography className="status-text">{status}</Typography>
  </StatusBadge>
);

CollectionStatus.propTypes = {
  status: PropTypes.string.isRequired,
  collectionName: PropTypes.string.isRequired,
};

export default CollectionStatus;
