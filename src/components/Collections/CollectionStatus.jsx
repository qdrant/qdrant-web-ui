import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link } from 'react-router-dom';

const StatusBadge = styled(Box)(({ status }) => {
  const getStatusStyles = (status) => {
    switch (status?.toLowerCase()) {
      case 'green':
        return {
          backgroundColor: 'rgba(0, 105, 92, 0.08)',
          dotColor: '#00897b',
          textColor: '#00897b',
        };
      case 'yellow':
        return {
          backgroundColor: 'rgba(239, 108, 0, 0.08)',
          dotColor: '#ef6c00',
          textColor: '#ef6c00',
        };
      case 'gray':
        return {
          backgroundColor: 'rgba(17, 24, 36, 0.08)',
          dotColor: '#656b7f',
          textColor: '#656b7f',
        };
      case 'red':
        return {
          backgroundColor: 'rgba(211, 47, 47, 0.08)',
          dotColor: '#d32f2f',
          textColor: '#d32f2f',
        };
      default:
        return {
          backgroundColor: 'rgba(0, 105, 92, 0.08)',
          dotColor: '#00897b',
          textColor: '#00897b',
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
      fontFamily: '"Mona Sans", sans-serif',
      fontSize: '12px',
      fontWeight: 500,
      lineHeight: 1.5,
      color: styles.textColor,
      textTransform: 'uppercase',
    },
  };
});

const CollectionStatus = ({ status, collectionName }) => (
  <StatusBadge status={status} component={Link} to={`/collections/${collectionName}#info`} sx={{ textDecoration: 'none' }}>
    <div className="status-dot" />
    <Typography className="status-text">{status}</Typography>
  </StatusBadge>
);

CollectionStatus.propTypes = {
  status: PropTypes.string.isRequired,
  collectionName: PropTypes.string.isRequired,
};

export default CollectionStatus;
