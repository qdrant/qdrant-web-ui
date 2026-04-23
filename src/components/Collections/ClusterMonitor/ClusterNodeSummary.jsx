import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import SortIcon from '@mui/icons-material/Sort';
import { Box, Chip, IconButton, Tooltip, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Circle } from '../../Common/Circle';
import { humanizePascalCase } from '../../../lib/common-helpers';
import { CLUSTER_COLORS, getHighContrastClusterColors } from './constants';

/** Container query: when summary cell is at least this wide, show the full (non-compact) layout. */
const WIDE_QUERY = '@container nodeSummary (min-width: 200px)';

function sortedShardStateCounts(shards) {
  const stateCounts = shards.reduce((acc, shard) => {
    const key = shard.state || 'Unknown';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const stateKeys = Object.keys(stateCounts).sort((a, b) => {
    if (a === 'Active') return -1;
    if (b === 'Active') return 1;
    return a.localeCompare(b);
  });
  return stateKeys.map((state) => ({ state, count: stateCounts[state] }));
}

/**
 * Legend colors for shard state labels (aligned with StyledShardSlot / cluster legend).
 * @param {string} state
 * @param {object} theme
 * @return {string}
 */
function colorForShardState(state, theme) {
  const colors = theme.palette.highContrast ? getHighContrastClusterColors(theme) : CLUSTER_COLORS;
  const s = String(state ?? '').toLowerCase();
  if (s === 'active') return colors.active;
  if (s === 'dead') return colors.dead;
  if (s === 'empty') {
    return theme.palette.mode === 'dark' ? colors.empty.dark : colors.empty.light;
  }
  return colors.default;
}

/**
 * Shard count + colored status dots and transfer counts (wide header row and compact tooltip body).
 * @param {Object} props
 * @param {number} props.shardsLength
 * @param {Array<{ state: string, count: number }>} props.shardStateEntries
 * @param {number} props.transferOut
 * @param {number} props.transferIn
 * @param {object} props.theme MUI theme
 * @param {boolean} props.nestedTooltips True: wide header (nested Tooltips). False: tooltip body (plain markup).
 * @param {object} props.sx
 * @return {React.JSX.Element}
 */
function PeerShardSummaryBadges({
  shardsLength,
  shardStateEntries,
  transferOut,
  transferIn,
  theme,
  nestedTooltips,
  sx,
}) {
  const badge = ({ state, count }) => (
    <Box
      component="span"
      aria-label={`${count} shard${count === 1 ? '' : 's'} ${humanizePascalCase(state)}`}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.35,
        cursor: 'default',
      }}
    >
      <Circle color={colorForShardState(state, theme)} size="0.5rem" sx={{ flexShrink: 0 }} />
      <Typography variant="caption" color="text.secondary" component="span" sx={{ lineHeight: 1.35 }}>
        {count}
      </Typography>
    </Box>
  );

  return (
    <Box
      sx={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        alignContent: 'flex-start',
        gap: 0.75,
        rowGap: 0.35,
        display: 'flex',
        ...sx,
      }}
    >
      <Typography variant="caption" color="text.secondary" component="span" sx={{ lineHeight: 1.35 }}>
        {shardsLength} shard{shardsLength === 1 ? '' : 's'}
      </Typography>
      {shardStateEntries.map(({ state, count }) =>
        nestedTooltips ? (
          <Tooltip key={state} title={humanizePascalCase(state)} arrow placement="bottom">
            {badge({ state, count })}
          </Tooltip>
        ) : (
          <Fragment key={state}>{badge({ state, count })}</Fragment>
        )
      )}
      {transferOut > 0 &&
        (nestedTooltips ? (
          <Tooltip title="Transfers out" arrow placement="top">
            <Typography
              component="span"
              variant="caption"
              color="text.secondary"
              sx={{ lineHeight: 1.35, cursor: 'default', display: 'inline-block' }}
            >
              ↗{transferOut}
            </Typography>
          </Tooltip>
        ) : (
          <Typography
            component="span"
            variant="caption"
            color="text.secondary"
            aria-label={`${transferOut} transfer${transferOut === 1 ? '' : 's'} out`}
            sx={{ lineHeight: 1.35, display: 'inline-block' }}
          >
            ↗{transferOut}
          </Typography>
        ))}
      {transferIn > 0 &&
        (nestedTooltips ? (
          <Tooltip title="Transfers in" arrow placement="top">
            <Typography
              component="span"
              variant="caption"
              color="text.secondary"
              sx={{ lineHeight: 1.35, cursor: 'default', display: 'inline-block' }}
            >
              ↙{transferIn}
            </Typography>
          </Tooltip>
        ) : (
          <Typography
            component="span"
            variant="caption"
            color="text.secondary"
            aria-label={`${transferIn} transfer${transferIn === 1 ? '' : 's'} in`}
            sx={{ lineHeight: 1.35, display: 'inline-block' }}
          >
            ↙{transferIn}
          </Typography>
        ))}
    </Box>
  );
}

PeerShardSummaryBadges.propTypes = {
  shardsLength: PropTypes.number.isRequired,
  shardStateEntries: PropTypes.arrayOf(
    PropTypes.shape({
      state: PropTypes.string,
      count: PropTypes.number,
    })
  ).isRequired,
  transferOut: PropTypes.number.isRequired,
  transferIn: PropTypes.number.isRequired,
  theme: PropTypes.object.isRequired,
  nestedTooltips: PropTypes.bool.isRequired,
  sx: PropTypes.object,
};

/**
 * Peer summary header for the cluster monitor (same grid row = equal cell heights).
 * Uses CSS container queries to switch between compact and full layouts based on its
 * own rendered width — avoids JS measurement and re-render flashing.
 * @param {Object} props
 * @param {number} props.peerId
 * @param {Object} props.cluster
 * @param {?('filled-first')} props.sortDirection
 * @param {function} props.onSetSort
 * @return {React.JSX.Element}
 */
const ClusterNodeSummary = ({ peerId, cluster, sortDirection, onSetSort }) => {
  const theme = useTheme();

  const handleSortToggle = () => {
    onSetSort(peerId, sortDirection ? null : 'filled-first');
  };

  const shards = cluster.shards.filter((shard) => shard.peer_id === peerId);
  const transfers = cluster.shard_transfers || [];
  const shardStateEntries = sortedShardStateCounts(shards);
  const transferOut = transfers.filter((t) => t.from === peerId).length;
  const transferIn = transfers.filter((t) => t.to === peerId).length;
  const isLocalPeer = cluster.peer_id != null && cluster.peer_id === peerId;

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        pb: 1,
        minWidth: 0,
        containerType: 'inline-size',
        containerName: 'nodeSummary',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          minWidth: 0,
          flexWrap: 'wrap',
          justifyContent: 'center',
          mb: 0,
          [WIDE_QUERY]: {
            justifyContent: 'flex-start',
            mb: 0.25,
          },
        }}
      >
        <Box
          sx={{
            display: 'none',
            flex: 1,
            minWidth: 0,
            alignItems: 'center',
            gap: 0.75,
            [WIDE_QUERY]: { display: 'flex' },
          }}
        >
          <Typography component="h3" variant="subtitle2" sx={{ fontWeight: 600, flexShrink: 0, minWidth: 0 }}>
            Peer {peerId}
          </Typography>
          {isLocalPeer && (
            <Chip
              label="Local"
              size="small"
              color="primary"
              variant="outlined"
              sx={(theme) => ({
                flexShrink: 0,
                height: theme.spacing(2.5),
                '& .MuiChip-label': {
                  px: theme.spacing(0.75),
                  py: 0,
                  lineHeight: 1.2,
                },
              })}
            />
          )}
        </Box>
        <Tooltip
          title={sortDirection ? 'Reset to default order' : `Sort filled slots first for peer ${peerId}`}
          placement="bottom"
          arrow
        >
          <IconButton
            size="small"
            onClick={handleSortToggle}
            color={sortDirection ? 'primary' : 'default'}
            aria-label={`Sort by peer ${peerId}`}
            sx={(theme) => ({
              flexShrink: 0,
              p: 0.25,
              ...(sortDirection && {
                backgroundColor: theme.palette.action.selected,
                '&:hover': {
                  backgroundColor: theme.palette.action.focus,
                },
              }),
            })}
          >
            <SortIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      <Box
        sx={{
          flex: 1,
          flexDirection: 'row',
          minHeight: 0,
          mt: 0.25,
          display: 'none',
          [WIDE_QUERY]: { display: 'block' },
        }}
      >
        <PeerShardSummaryBadges
          shardsLength={shards.length}
          shardStateEntries={shardStateEntries}
          transferOut={transferOut}
          transferIn={transferIn}
          theme={theme}
          nestedTooltips
        />
      </Box>
    </Box>
  );
};

ClusterNodeSummary.propTypes = {
  peerId: PropTypes.number.isRequired,
  cluster: PropTypes.shape({
    peer_id: PropTypes.number,
    shards: PropTypes.array.isRequired,
    shard_transfers: PropTypes.arrayOf(
      PropTypes.shape({
        shard_id: PropTypes.number,
        from: PropTypes.number,
        to: PropTypes.number,
      })
    ),
  }).isRequired,
  sortDirection: PropTypes.oneOf(['filled-first', null]),
  onSetSort: PropTypes.func.isRequired,
};

export default ClusterNodeSummary;
