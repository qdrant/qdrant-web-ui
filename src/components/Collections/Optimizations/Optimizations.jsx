import React, { memo, useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Card, CardHeader, CardContent, Box, Typography } from '@mui/material';
import { CopyButton } from '../../Common/CopyButton';
import OptimizationNode from './OptimizationNode';
import { MOCK_DATA, MOCK_REQUEST_TIME } from './constants';
import { parseTime, getTreeTimeRange, enrichWithDuration } from './helpers';

const Optimizations = ({ collectionName, ...other }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    // Mock API call
    const timer = setTimeout(() => {
      setData(MOCK_DATA);
    }, 500);
    return () => clearTimeout(timer);
  }, [collectionName]);

  const { enrichedNodes, totalDuration, maxTime } = useMemo(() => {
    if (!data || !data.result || !data.result.ongoing)
      return { enrichedNodes: [], totalDuration: 0, maxTime: 0 };
    const { min, max } = getTreeTimeRange(data.result.ongoing);
    // If we only have start times or empty, handle safely
    if (min === Infinity || max === -Infinity)
      return { enrichedNodes: [], totalDuration: 0, maxTime: 0 };

    // Use mock request time as the global "current time" end for ongoing tasks
    const requestTime = parseTime(MOCK_REQUEST_TIME);
    const end = Math.max(max, requestTime);
    
    // Add a small buffer to max time if it equals min (e.g. single start event)
    const totalDur = Math.max(end - min, 1000); // Ensure at least 1s duration if instant

    const enriched = enrichWithDuration(data.result.ongoing, end);

    return {
      enrichedNodes: enriched,
      totalDuration: totalDur,
      maxTime: end,
    };
  }, [data]);

  return (
    <Card elevation={0} {...other}>
      <CardHeader
        title={'Optimizations Tree'}
        variant="heading"
        sx={{
          flexGrow: 1,
        }}
        action={<CopyButton text={JSON.stringify(data)} />}
      />
      <CardContent sx={{ pt: 0 }}>
        <Box
          sx={{
            overflow: 'auto',
            borderRadius: 1,
            p: 1,
          }}
        >
          {enrichedNodes.length > 0 ? (
            enrichedNodes.map((node, index) => (
              <OptimizationNode
                key={index}
                node={node}
                totalDuration={totalDuration}
                maxTime={maxTime}
              />
            ))
          ) : !data ? (
            <Typography variant="body2" color="text.secondary" align="center">
              Loading optimizations...
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary" align="center">
              No ongoing optimizations
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

Optimizations.propTypes = {
  collectionName: PropTypes.string.isRequired,
};

export default memo(Optimizations);
