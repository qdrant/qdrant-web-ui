import React from 'react';
import PropTypes from 'prop-types';
import { Box, Button, Tooltip, Link } from '@mui/material';
import { ArrowUp, ArrowDown, X } from 'lucide-react';

/**
 * ReshardingButtons component - displays resharding control buttons
 * @param {Object} props
 * @param {Object} props.cluster - Cluster information object
 * @param {boolean} props.reshardingEnabled - Whether resharding is enabled
 * @param {boolean} props.reshardingLoading - Whether a resharding operation is in progress
 * @param {boolean} props.transferLoading - Whether a transfer operation is in progress
 * @param {Function} props.onResharding - Callback when resharding is triggered (direction: 'up' | 'down')
 * @param {Function} props.onAbortResharding - Callback when abort resharding is triggered
 * @return {React.JSX.Element}
 */
const ReshardingButtons = ({
  cluster,
  reshardingEnabled,
  reshardingLoading,
  transferLoading,
  onResharding,
  onAbortResharding,
}) => {
  const hasOngoingResharding = cluster?.resharding_operations && cluster.resharding_operations.length > 0;
  const hasEnoughNodes = cluster?.peers?.length >= 2;
  const shardCount = cluster?.shard_count || 0;
  const hasShards = cluster?.shards && cluster.shards.length > 0;
  const canReshardDown = shardCount > 1;
  const canReshardUp = hasShards;
  const isDisabled = !reshardingEnabled || !hasEnoughNodes || reshardingLoading || transferLoading || !canReshardUp;
  const isReshardDownDisabled = isDisabled || !canReshardDown;

  const tooltipContent = !reshardingEnabled ? (
    <Box>
      Resharding is not available.{' '}
      <Link
        href="https://qdrant.tech/documentation/cloud/cluster-scaling/#resharding"
        target="_blank"
        rel="noopener noreferrer"
        sx={{ color: 'inherit', textDecoration: 'underline' }}
        onClick={(e) => e.stopPropagation()}
      >
        Learn more
      </Link>
    </Box>
  ) : !hasShards ? (
    'Cannot reshard up: collection has no shards'
  ) : !hasEnoughNodes ? (
    'Resharding requires at least 2 nodes in the cluster'
  ) : (
    ''
  );

  const reshardDownTooltipContent =
    !canReshardDown && shardCount === 1
      ? 'Cannot reshard down: collection already has the minimum of 1 shard'
      : !hasShards
      ? 'Cannot reshard down: collection has no shards'
      : tooltipContent || 'Reshard down (remove shard)';

  // Show cancel button if resharding is ongoing
  if (hasOngoingResharding) {
    return (
      <Tooltip title="Cancel ongoing resharding operation" placement="top">
        <span>
          <Button
            variant="outlined"
            size="small"
            color="error"
            startIcon={<X size={18} />}
            onClick={onAbortResharding}
            disabled={reshardingLoading || transferLoading}
            aria-label="Cancel resharding"
            sx={{
              minWidth: 'auto',
              fontSize: '0.8125rem',
              padding: '0.25rem 0.625rem',
            }}
          >
            Cancel Resharding
          </Button>
        </span>
      </Tooltip>
    );
  }

  // Show up/down buttons if no resharding is ongoing
  return (
    <>
      <Tooltip title={tooltipContent || 'Reshard up (add shard)'} placement="top">
        <span>
          <Button
            variant="outlined"
            size="small"
            startIcon={<ArrowUp size={18} />}
            onClick={() => onResharding('up')}
            disabled={isDisabled}
            aria-label="Reshard up"
            sx={{
              minWidth: 'auto',
              fontSize: '0.8125rem',
              padding: '0.25rem 0.625rem',
            }}
          >
            Reshard Up
          </Button>
        </span>
      </Tooltip>
      <Tooltip title={reshardDownTooltipContent} placement="top">
        <span>
          <Button
            variant="outlined"
            size="small"
            startIcon={<ArrowDown size={18} />}
            onClick={() => onResharding('down')}
            disabled={isReshardDownDisabled}
            aria-label="Reshard down"
            sx={{
              minWidth: 'auto',
              fontSize: '0.8125rem',
              padding: '0.25rem 0.625rem',
            }}
          >
            Reshard Down
          </Button>
        </span>
      </Tooltip>
    </>
  );
};

ReshardingButtons.propTypes = {
  cluster: PropTypes.object,
  reshardingEnabled: PropTypes.bool.isRequired,
  reshardingLoading: PropTypes.bool.isRequired,
  transferLoading: PropTypes.bool.isRequired,
  onResharding: PropTypes.func.isRequired,
  onAbortResharding: PropTypes.func.isRequired,
};

export default ReshardingButtons;
