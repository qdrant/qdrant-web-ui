import React, { memo, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { axiosInstance as axios } from '../../../common/axios';
import MemoryTree from './MemoryTree';

const Memory = ({ collectionName }) => {
  const [data, setData] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  return (
    <Box display="flex" flexDirection="column" gap={5}>
      <MemoryTree data={data} onRefresh={fetchData} isRefreshing={isRefreshing} />
    </Box>
  );
};

Memory.propTypes = {
  collectionName: PropTypes.string.isRequired,
};

export default memo(Memory);
