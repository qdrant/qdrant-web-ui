import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Card, CardHeader, CardContent, Box, Typography } from '@mui/material';
import { CopyButton } from '../../../Common/CopyButton';
import OptimizationNode from './OptimizationNode';
import { getTreeTimeRange, enrichWithDuration } from './helpers';

/**
 * Extract optimization trees from the API response.
 * Handles both:
 * - Raw API response: running[].progress contains the tree
 * - Preprocessed selection: running[] contains the tree data directly (spread from progress)
 * @param {Object} data - The API response data
 * @return {Array} Array of optimization tree nodes
 */
const extractOptimizationTrees = (data) => {
  if (!data || !data.result) return [];

  const running = data.result.running || [];

  // Check if this is preprocessed data (has children directly) or raw API data (has progress field)
  return running.map((opt) => {
    // If this is raw API data, the tree is in the progress field
    if (opt.progress && opt.progress.children) {
      return opt.progress;
    }
    // If this is preprocessed data from timeline selection, the tree data is spread into the object
    if (opt.children) {
      return opt;
    }
    // Fallback: return the progress if it exists, otherwise the opt itself
    return opt.progress || opt;
  });
};

const OptimizationsTree = ({ data, requestTime, ...other }) => {
  const { enrichedNodes, totalDuration, maxTime } = useMemo(() => {
    const trees = extractOptimizationTrees(data);
    if (trees.length === 0) return { enrichedNodes: [], totalDuration: 0, maxTime: 0 };

    const { min, max } = getTreeTimeRange(trees);
    // If we only have start times or empty, handle safely
    if (min === Infinity || max === -Infinity) return { enrichedNodes: [], totalDuration: 0, maxTime: 0 };

    // Use mock request time as the global "current time" end for ongoing tasks
    const end = Math.max(max, requestTime);

    // Add a small buffer to max time if it equals min (e.g. single start event)
    const MIN_DURATION = 1000;
    const totalDur = Math.max(end - min, MIN_DURATION); // Ensure at least 1s duration if instant

    const enriched = enrichWithDuration(trees, end);

    return {
      enrichedNodes: enriched,
      totalDuration: totalDur,
      maxTime: end,
    };
  }, [data, requestTime]);

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
            pt: 2,
            pr: 0.5,
          }}
        >
          {enrichedNodes.length > 0 ? (
            enrichedNodes.map((node) => (
              <OptimizationNode
                key={`${node.name}-${node.started_at}`}
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
            <Typography variant="body2" color="text.secondary" align="center" sx={{ pt: 1 }}>
              No running optimizations
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

OptimizationsTree.propTypes = {
  data: PropTypes.object,
  requestTime: PropTypes.number,
};

export default OptimizationsTree;
