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
    // Clear selected optimization when refreshing to show updated data
    setSelectedOptimization(null);
    axios
      .get(`/collections/${collectionName}/optimizations?with=queued,completed,idle_segments`)
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
      // Wrap the selected optimization in the expected format for OptimizationsTree
      // The optimization already has the progress tree spread into it from preprocess
      setSelectedOptimization({ result: { running: [optimization] } });
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
        selectedItem={selectedOptimization?.result?.running?.[0]}
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
