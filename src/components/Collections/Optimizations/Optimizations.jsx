import React, { memo, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { MOCK_DATA } from './Tree/constants';
import { MOCK_DATA as timelineData, MOCK_REQUEST_TIME as timelineRequestTime } from './Timeline/mock';
import Timeline from './Timeline/Timeline';
import OptimizationsTree from './Tree/OptimizationsTree';

const Optimizations = ({ collectionName }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    // Mock API call
    const timer = setTimeout(() => {
      setData(MOCK_DATA);
    }, 500);
    return () => clearTimeout(timer);
  }, [collectionName]);

  return (
    <Box display="flex" flexDirection="column" gap={5}>
      <Timeline data={timelineData} requestTime={timelineRequestTime} />
      <OptimizationsTree data={data} />
    </Box>
  );
};

Optimizations.propTypes = {
  collectionName: PropTypes.string.isRequired,
};

export default memo(Optimizations);
