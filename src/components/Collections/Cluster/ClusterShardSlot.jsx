import React from 'react';
import { useTheme } from '@mui/material/styles';
import { ArcherElement } from 'react-archer';
import PropTypes from 'prop-types';
import { Typography } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import { StyledShardSlot } from './StyledComponents/StyledShardSlot';
import { StyledTooltip } from './StyledComponents/StyledTooltip';

const TooltipRow = ({ label, value }) => (
  <Typography variant="caption">
    <b>{label}:</b> {value}
  </Typography>
);
TooltipRow.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

const Slot = ({ id, currentPeerId, shard, transfer, peersNumber }) => {
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
      targetId: `${transfer.transfer.to}-${transfer.transfer.to_shard_id || transfer.transfer.shard_id}`,
      targetAnchor: targetAnchorDirection,
      sourceAnchor: sourceAnchorDirection,
      style: {
        strokeWidth: '2',
        endMarker: true,
        endShape: {
          arrow: {
            arrowLength: 2,
          },
        },
      },
    });
  }

  return (
    <ArcherElement id={`${currentPeerId}-${id}`} relations={relations}>
      <div style={{ position: 'static' }}>
        <StyledTooltip
          arrow
          placement="top"
          title={
            <>
              <TooltipRow label="Peer Id" value={currentPeerId} />
              {shard?.shard_id && (
                <>
                  <br />
                  <TooltipRow label="Shard Id" value={shard.shard_id} />
                </>
              )}
              {shard?.shard_key && (
                <>
                  <br />
                  <TooltipRow label="Shard Key" value={shard.shard_key} />
                </>
              )}
              {shard?.state && (
                <>
                  <br />
                  <TooltipRow label="Shard State" value={shard.state} />
                </>
              )}
            </>
          }
        >
          <StyledShardSlot state={shard ? shard.state.toLowerCase() : 'empty'}>
            {shard && (
              <Typography variant="subtitle2" sx={{ textAlign: 'center', fontWeight: 'bold' }}>
                {`${!matches && peersNumber <= 12 ? 'Shard' : ''} ${shard.shard_id}`}
              </Typography>
            )}
            {shard?.shard_key && (
              <>
                <br />
                <Typography variant="subtitle2" sx={{ textAlign: 'center', fontWeight: 'bold' }}>
                  {peersNumber <= 10 ? `${shard.shard_key}` : ''}
                </Typography>
              </>
            )}
          </StyledShardSlot>
        </StyledTooltip>
      </div>
    </ArcherElement>
  );
};

Slot.displayName = 'Slot';

Slot.propTypes = {
  id: PropTypes.number.isRequired,
  currentPeerId: PropTypes.number.isRequired,
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
