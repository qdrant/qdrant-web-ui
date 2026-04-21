import React, { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SortIcon from '@mui/icons-material/Sort';
import { Box, Chip, IconButton, Tooltip, Typography } from '@mui/material';
import { humanizePascalCase } from '../../../lib/common-helpers';

/** When the summary cell is narrower than this, show summary in an info tooltip only. */
const COMPACT_SUMMARY_MAX_WIDTH_PX = 200;

function buildNodeSummaryLines({ shards, transfers, peerId }) {
  const total = shards.length;
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

  const parts = [`${total} shard${total === 1 ? '' : 's'}`];

  if (total > 0) {
    if (stateKeys.length === 1) {
      const only = stateKeys[0];
      parts.push(only === 'Active' ? 'all active' : `all ${humanizePascalCase(only)}`);
    } else {
      stateKeys.forEach((state) => {
        const n = stateCounts[state];
        parts.push(`${n} ${humanizePascalCase(state)}`);
      });
    }
  }

  const outgoing = transfers.filter((t) => t.from === peerId).length;
  const incoming = transfers.filter((t) => t.to === peerId).length;
  if (outgoing) {
    parts.push(`${outgoing} transfer${outgoing === 1 ? '' : 's'} out`);
  }
  if (incoming) {
    parts.push(`${incoming} transfer${incoming === 1 ? '' : 's'} in`);
  }

  return parts;
}

/**
 * Peer summary header for the cluster monitor (same grid row = equal cell heights).
 * @param {Object} props
 * @param {number} props.peerId
 * @param {Object} props.cluster
 * @param {boolean} props.isSortActive
 * @param {function} props.onToggleSort
 * @return {React.JSX.Element}
 */
const ClusterNodeSummary = ({ peerId, cluster, isSortActive, onToggleSort }) => {
  const rootRef = useRef(null);
  const [compact, setCompact] = useState(false);

  const shards = cluster.shards.filter((shard) => shard.peer_id === peerId);
  const transfers = cluster.shard_transfers || [];
  const summaryLines = buildNodeSummaryLines({ shards, transfers, peerId });
  const isLocalPeer = cluster.peer_id != null && cluster.peer_id === peerId;

  const updateCompactFromWidth = useCallback((width) => {
    if (width <= 0) return;
    setCompact(width < COMPACT_SUMMARY_MAX_WIDTH_PX);
  }, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof ResizeObserver === 'undefined') {
      return undefined;
    }
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect?.width ?? 0;
      updateCompactFromWidth(w);
    });
    ro.observe(el);
    updateCompactFromWidth(el.getBoundingClientRect().width);
    return () => ro.disconnect();
  }, [updateCompactFromWidth]);

  const tooltipTitle = (
    <Box sx={{ py: 0.25, maxWidth: 280 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.75 }}>
        Peer {peerId}
        {isLocalPeer ? ' (local)' : ''}
      </Typography>
      {summaryLines.map((line, index) => (
        <Typography
          key={`${peerId}-tooltip-${index}`}
          variant="body2"
          sx={{ display: 'block', lineHeight: 1.4, mb: index < summaryLines.length - 1 ? 0.5 : 0 }}
        >
          {line}
        </Typography>
      ))}
    </Box>
  );

  return (
    <Box
      ref={rootRef}
      sx={(theme) => ({
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderBottom: `1px solid ${theme.palette.divider}`,
        pb: 1,
        minWidth: 0,
      })}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          minWidth: 0,
          mb: compact ? 0 : 0.25,
          flexWrap: compact ? 'nowrap' : 'wrap',
          justifyContent: compact ? 'flex-end' : 'flex-start',
        }}
      >
        {!compact && (
          <Typography component="h3" variant="subtitle2" sx={{ fontWeight: 600, flex: 1, minWidth: 0 }}>
            Peer {peerId}
          </Typography>
        )}
        {isLocalPeer && !compact && (
          <Chip label="Local" size="small" color="primary" variant="outlined" sx={{ flexShrink: 0 }} />
        )}
        {compact && (
          <Tooltip title={tooltipTitle} placement="top" arrow>
            <IconButton
              size="small"
              aria-label={`Summary for peer ${peerId}`}
              sx={{ flexShrink: 0, p: 0.25 }}
            >
              <InfoOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        <Tooltip
          title={isSortActive ? 'Clear sort' : 'Sort all columns: filled slots first'}
          placement="top"
          arrow
        >
          <IconButton
            size="small"
            onClick={() => onToggleSort(peerId)}
            color={isSortActive ? 'primary' : 'default'}
            aria-label={isSortActive ? `Clear sort by peer ${peerId}` : `Sort by peer ${peerId}`}
            sx={{ flexShrink: 0, p: 0.25 }}
          >
            <SortIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      {!compact && (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.25, minHeight: 0 }}>
          {summaryLines.map((line, index) => (
            <Typography
              key={`${peerId}-summary-${index}`}
              variant="caption"
              color="text.secondary"
              sx={{ lineHeight: 1.35 }}
            >
              {line}
            </Typography>
          ))}
        </Box>
      )}
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
  isSortActive: PropTypes.bool.isRequired,
  onToggleSort: PropTypes.func.isRequired,
};

export default ClusterNodeSummary;
