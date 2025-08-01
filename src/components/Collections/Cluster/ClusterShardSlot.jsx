import React, { forwardRef } from 'react';
import { useTheme } from '@mui/material/styles';
import { ArcherElement } from 'react-archer';
import PropTypes from 'prop-types';
import { Typography } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import { StyledShardSlot } from './StyledComponents/StyledShardSlot';
import { StyledTooltip } from './StyledComponents/StyledTooltip';

const TooltipRow = ({label, value}) => (
  <Typography variant='caption'>
    <b>{label}:</b> {value}
  </Typography>
);
TooltipRow.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
}

const Slot = forwardRef(({
                           id,
                           peerId: currentPeerId,
                           shard,
                           transfer,
                           peersNumber
                         }, ref) => {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('md'));

  const relations = [];
  if (transfer?.transfer) {
    let targetAnchorDirection;
    let sourceAnchorDirection;

    if (transfer.transfer.to > transfer.transfer.from) {
      targetAnchorDirection = 'left';
      sourceAnchorDirection = 'right';
    } else {
      targetAnchorDirection = 'right';
      sourceAnchorDirection = 'left';
    }

    relations.push({
      targetId: `${transfer.transfer.to}-${transfer.transfer.to_shard_id ||
      transfer.transfer.shard_id}`,
      targetAnchor: targetAnchorDirection,
      sourceAnchor: sourceAnchorDirection,
      style: {
        strokeWidth: '2',
        endMarker: true,
        endShape: {
          arrow: {
            arrowLength: 2,
          }
        }
      },
    });
  }

  return (
    <ArcherElement id={`${currentPeerId}-${id}`} relations={relations}>
        <div style={{position: 'static'}} ref={ref}>
          <StyledTooltip
            arrow
            placement='top'
            title={
              <>
                <TooltipRow label='Peer Id' value={currentPeerId} /><br />
                {shard ? (
                  <>
                    <TooltipRow label='Shard Id' value={shard.shard_id} /><br />
                    <TooltipRow label='Shard Key' value={shard.shard_key || 'N/A'} /><br />
                    <TooltipRow label='Shard State' value={shard.state} /><br />
                  </>
                ) : (
                  <Typography variant='caption'><b>Shard State:</b> Empty</Typography>
                )}
              </>
            }
          >
          <StyledShardSlot
            state={shard ? shard.state.toLowerCase() : 'empty'}
            sx={{
              minWidth: peersNumber >= 40 ? '22px' : 'auto',
              maxWidth: peersNumber >= 40 ? '22px' : 'unset',
              aspectRatio: peersNumber >= 40 ? '11/16' : 'unset',
              height: peersNumber >= 40 ? '2rem' : '80px',
            }}
          >
            {shard && (
              <Typography variant="subtitle2" sx={{ textAlign: 'center', fontWeight: 'bold' }}>
                {`${(!matches && peersNumber <= 20 ? 'Shard' : '')} ${shard.shard_id}`}
              </Typography>
            )}
            {shard?.shard_key && (

              <Typography variant="subtitle2" sx={{ textAlign: 'center', fontWeight: 'bold' }}>
                {(peersNumber <= 5 ? `${shard.shard_key}` : '')}
              </Typography>
            )}
          </StyledShardSlot>
      </StyledTooltip>
        </div>
    </ArcherElement>
  );
});

Slot.displayName = 'Slot';

Slot.propTypes = {
  id: PropTypes.number.isRequired,
  peerId: PropTypes.number.isRequired,
  shard: PropTypes.shape({
    shard_id: PropTypes.number.isRequired,
    state: PropTypes.string,
    points_count: PropTypes.number,
    peer_id: PropTypes.number.isRequired,
    shard_key: PropTypes.string,
  }),
  transfer: PropTypes.shape({
    transfer: PropTypes.shape({
      shard_id: PropTypes.number,
      from: PropTypes.number,
      to: PropTypes.number,
      to_shard_id: PropTypes.number,
    }),
  }),
  peersNumber: PropTypes.number,
};

export default Slot;
