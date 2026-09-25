import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { ButtonBase, ClickAwayListener, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { StyledTooltip } from './StyledComponents/StyledTooltip';
import { getTransferArrowColors } from './constants';

/** Diameter of the marker, in px; compact markers fit the narrow slots of large clusters. */
const MARKER_SIZE = 16;
const COMPACT_MARKER_SIZE = 12;
/** Invisible margin around the marker that still reacts to the pointer, so it is easier to hit. */
const HIT_BUFFER = 4;
const BORDER_WIDTH = 2;

/**
 * Circle in the middle of a shard transfer arrow. Its tooltip shows the progress
 * Qdrant reports for the transfer (`ShardTransferInfo.comment`) as is, since the
 * comment is free text without a fixed format. The tooltip opens on click and
 * stays open until the next click on the marker or outside of it (or Escape).
 * @param {Object} props
 * @param {Object} props.transfer - `ShardTransferInfo` of the transfer
 * @param {boolean} props.compact - use a smaller marker (for narrow slots)
 * @return {React.JSX.Element}
 */
const TransferProgressMarker = ({ transfer, compact = false }) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  const { shard_id: shardId, to_shard_id: toShardId, from, to, method, comment } = transfer;
  const target = toShardId != null && toShardId !== shardId ? ` (shard ${toShardId})` : '';
  const title = `Shard ${shardId}: peer ${from} → peer ${to}${target}`;
  const size = compact ? COMPACT_MARKER_SIZE : MARKER_SIZE;
  const { stroke: color } = getTransferArrowColors(theme);

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') setOpen(false);
  };

  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <span>
        <StyledTooltip
          arrow
          describeChild
          placement="top"
          open={open}
          disableHoverListener
          disableFocusListener
          disableTouchListener
          title={
            <>
              <Typography variant="caption" component="p" sx={{ fontWeight: 'bold' }}>
                {title}
              </Typography>
              {method && (
                <Typography variant="caption" component="p" sx={{ opacity: 0.75 }}>
                  {method}
                </Typography>
              )}
              <Typography
                variant="caption"
                component="p"
                sx={{
                  mt: 0.5,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  fontStyle: comment ? 'normal' : 'italic',
                }}
              >
                {comment || 'No progress reported by this peer'}
              </Typography>
            </>
          }
        >
          <ButtonBase
            aria-label={`Progress of the transfer of shard ${shardId} from peer ${from} to peer ${to}`}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
            onKeyDown={handleKeyDown}
            sx={{
              display: 'block',
              width: size,
              height: size,
              borderRadius: '50%',
              border: `${BORDER_WIDTH}px solid ${color}`,
              backgroundColor: open ? color : theme.palette.background.paper,
              boxShadow: open ? `0 0 0 3px ${theme.palette.action.selected}` : 'none',
              cursor: 'pointer',
              transition: theme.transitions.create(['transform', 'background-color']),
              '&:hover, &.Mui-focusVisible': { transform: 'scale(1.25)' },
              '&::before': {
                content: '""',
                position: 'absolute',
                inset: -(HIT_BUFFER + BORDER_WIDTH),
                borderRadius: '50%',
              },
              '&.Mui-focusVisible': { outline: `2px solid ${theme.palette.primary.main}`, outlineOffset: 2 },
            }}
          />
        </StyledTooltip>
      </span>
    </ClickAwayListener>
  );
};

TransferProgressMarker.propTypes = {
  transfer: PropTypes.shape({
    shard_id: PropTypes.number.isRequired,
    to_shard_id: PropTypes.number,
    from: PropTypes.number.isRequired,
    to: PropTypes.number.isRequired,
    method: PropTypes.string,
    comment: PropTypes.string,
  }).isRequired,
  compact: PropTypes.bool,
};

export default TransferProgressMarker;
