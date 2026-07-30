import React from 'react';
import PropTypes from 'prop-types';
import { Alert, AlertTitle, Box, Typography } from '@mui/material';
import { LoaderCircle } from 'lucide-react';

const Spinner = () => (
  <Box
    component={LoaderCircle}
    size={18}
    aria-hidden="true"
    sx={{
      animation: 'reshardingSpin 1.2s linear infinite',
      '@keyframes reshardingSpin': { to: { transform: 'rotate(360deg)' } },
      '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
    }}
  />
);

/**
 * What the operation does to the cluster topology, e.g. "removing shard 2".
 * @param {Object} operation
 * @return {string}
 */
const describeTarget = ({ direction, shard_id: shardId, shard_key: shardKey }) => {
  const action = direction === 'down' ? 'removing' : 'adding';
  return `${action} shard ${shardId}${shardKey ? ` (shard key: ${shardKey})` : ''}`;
};

/**
 * Progress of the ongoing resharding operations of a collection.
 * Renders nothing when no operation is running. The reported progress is
 * optional: clusters that do not report it leave the headline on its own.
 * @param {Object} props
 * @param {Array<Object>} props.operations - `resharding_operations` of the collection cluster info
 * @param {?Object} props.progress - progress reported by the cluster manager
 * @return {?React.JSX.Element}
 */
const ReshardingStatus = ({ operations = [], progress = null }) => {
  if (operations.length === 0) {
    return null;
  }

  const targets = operations.map(describeTarget).join(', ');
  const headline =
    operations.length === 1
      ? `Resharding ${operations[0].direction} in progress: ${targets}`
      : `Resharding in progress: ${targets}`;
  const description = progress?.description?.trim();

  return (
    <Alert
      severity="info"
      role="status"
      aria-live="polite"
      icon={<Spinner />}
      sx={{ '& .MuiAlert-icon': { alignItems: 'center' } }}
    >
      <AlertTitle sx={{ mb: 0 }}>{headline}</AlertTitle>
      {description && (
        <Typography variant="body2">
          {description}
          {progress.waiting && (
            <Box component="span" sx={{ opacity: 0.75 }}>
              {' · waiting'}
            </Box>
          )}
        </Typography>
      )}
    </Alert>
  );
};

ReshardingStatus.propTypes = {
  operations: PropTypes.arrayOf(
    PropTypes.shape({
      uuid: PropTypes.string,
      direction: PropTypes.oneOf(['up', 'down']).isRequired,
      shard_id: PropTypes.number.isRequired,
      shard_key: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    })
  ),
  progress: PropTypes.shape({
    description: PropTypes.string,
    waiting: PropTypes.bool,
  }),
};

export default ReshardingStatus;
