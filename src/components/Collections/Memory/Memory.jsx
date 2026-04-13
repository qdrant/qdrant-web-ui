import React, { memo, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';
import { axiosInstance as axios } from '../../../common/axios';
import InfoBanner from '../../Common/InfoBanner';
import MemoryTree from './MemoryTree';

const RAM_DISCLAIMER_STORAGE_KEY = 'qdrant-memory-ram-disclaimer-dismissed';

const Memory = ({ collectionName }) => {
  const [data, setData] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(
    () => localStorage.getItem(RAM_DISCLAIMER_STORAGE_KEY) !== 'true'
  );

  const fetchData = useCallback(() => {
    setIsRefreshing(true);
    axios
      .get(`/collections/${encodeURIComponent(collectionName)}/memory`)
      .then((response) => setData(response.data))
      .catch((error) => console.error('Error fetching memory info:', error))
      .finally(() => setIsRefreshing(false));
  }, [collectionName]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDismissDisclaimer = () => {
    localStorage.setItem(RAM_DISCLAIMER_STORAGE_KEY, 'true');
    setShowDisclaimer(false);
  };

  return (
    <Box display="flex" flexDirection="column" gap={5}>
      {showDisclaimer && (
        <InfoBanner severity="info" onClose={handleDismissDisclaimer}>
          <Typography>
            RAM measurements are approximate. Actual memory usage can be up to 20% higher than reported due to
            allocator overhead and runtime factors.
          </Typography>
        </InfoBanner>
      )}
      <MemoryTree data={data} onRefresh={fetchData} isRefreshing={isRefreshing} />
    </Box>
  );
};

Memory.propTypes = {
  collectionName: PropTypes.string.isRequired,
};

export default memo(Memory);
