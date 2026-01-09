import React, { memo, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { axiosInstance as axios } from '../../../common/axios';
import { Box } from '@mui/material';
import Timeline from './Timeline/Timeline';
import OptimizationsTree from './Tree/OptimizationsTree';

const Optimizations = ({ collectionName }) => {
  const [data, setData] = useState(null);
  const [selectedOptimization, setSelectedOptimization] = useState(null);
  const [requestTime, setRequestTime] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = useCallback(() => {
    setIsRefreshing(true);
    axios
      .get(`/collections/${collectionName}/optimizations?completed=true`)
      .then((response) => {
        setData(response.data);
        setRequestTime(Date.now());
      })
      .catch((error) => {
        console.error('Error fetching optimizations:', error);
      })
      .finally(() => {
        setIsRefreshing(false);
      });
  }, [collectionName]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOptimizationSelect = (optimization) => {
    if (optimization) {
      setSelectedOptimization({ result: { ongoing: [optimization] } });
    } else {
      setSelectedOptimization(null);
    }
  };

  return (
    <Box display="flex" flexDirection="column" gap={5}>
      <Timeline
        data={data?.result}
        requestTime={requestTime}
        onSelect={handleOptimizationSelect}
        selectedItem={selectedOptimization?.result?.ongoing?.[0]}
        onRefresh={fetchData}
        isRefreshing={isRefreshing}
      />
      <OptimizationsTree data={selectedOptimization || data} requestTime={requestTime} />
    </Box>
  );
};

Optimizations.propTypes = {
  collectionName: PropTypes.string.isRequired,
};

export default memo(Optimizations);
