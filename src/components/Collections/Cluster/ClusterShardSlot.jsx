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

/**
 * Legend component to explain the status of shards in the cluster.
 * @param {number} id - The id of the slot.
 * @param {number} currentPeerId - The id of the current peer.
 * @param {object} shard - The shard object.
 * @param {object} transfer - The transfer object.
 * @param {number} peersNumber - The number of peers.
 * @param {string} dragAndDropState - The current drag and drop state.
 * @param {function} onSlotGrab - Function called when slot is grabbed.
 * @param {function} onSlotDrop - Function called when slot is dropped.
 * @param {function} onDragCancel - Function called when drag is cancelled.
 * @return {React.JSX.Element}
 * @constructor
 */
const Slot = ({
  id,
  currentPeerId,
  shard,
  transfer,
  peersNumber,
  dragAndDropState,
  onSlotGrab,
  onSlotDrop,
  onDragCancel,
}) => {
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

  // Handle mouse down for grabbing
  const handleMouseDown = (e) => {
    if (shard && shard.state === 'Active' && !dragAndDropState && !transfer?.transfer) {
      onSlotGrab(e, currentPeerId, id, shard);
    }
  };

  // Handle mouse up for dropping
  const handleMouseUp = () => {
    if (dragAndDropState === 'awaiting' && !shard) {
      onSlotDrop(currentPeerId, id);
    }
  };

  // Handle drag end to cancel if dropped outside valid zones
  const handleDragEnd = () => {
    if (dragAndDropState === 'grabbed') {
      onDragCancel();
    }
  };

  return (
    <ArcherElement id={`${currentPeerId}-${id}`} relations={relations}>
      <div style={{ position: 'static' }}>
        <StyledTooltip
          arrow
          placement="top"
          title={
            shard ? (
              <>
                <TooltipRow label="Peer Id" value={currentPeerId} />
                {'shard_id' in shard && (
                  <>
                    <br />
                    <TooltipRow label="Shard Id" value={shard.shard_id} />
                  </>
                )}
                {shard.shard_key && (
                  <>
                    <br />
                    <TooltipRow label="Shard Key" value={shard.shard_key} />
                  </>
                )}
                {shard.state && (
                  <>
                    <br />
                    <TooltipRow label="Shard State" value={shard.state} />
                  </>
                )}
                {shard.state === 'Active' && !transfer?.transfer && (
                  <>
                    <br />
                    <Typography variant="caption" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                      Drag to an empty slot to transfer
                    </Typography>
                  </>
                )}
                {transfer?.transfer && (
                  <>
                    <br />
                    <Typography variant="caption" sx={{ color: '#ff9800', fontWeight: 'bold' }}>
                      Transferring to peer {transfer.transfer.to}
                    </Typography>
                    <br />
                    <Typography variant="caption" sx={{ color: '#f44336', fontStyle: 'italic' }}>
                      Cannot be dragged during transfer
                    </Typography>
                  </>
                )}
              </>
            ) : dragAndDropState === 'awaiting' ? (
              <>
                <TooltipRow label="Peer Id" value={currentPeerId} />
                <br />
                <TooltipRow label="Slot Id" value={id} />
                <br />
                <Typography variant="caption" sx={{ color: '#fff', fontWeight: 'bold' }}>
                  Drop here to move shard
                </Typography>
              </>
            ) : (
              <>
                <TooltipRow label="Peer Id" value={currentPeerId} />
                <br />
                <TooltipRow label="Slot Id" value={id} />
                <br />
                <Typography variant="caption" sx={{ color: '#ccc' }}>
                  Empty slot
                </Typography>
              </>
            )
          }
        >
          <StyledShardSlot
            state={shard ? shard.state.toLowerCase() : 'empty'}
            dragAndDropState={dragAndDropState}
            isTransferring={!!transfer?.transfer}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onDragEnd={handleDragEnd}
            draggable={shard && shard.state === 'Active' && !dragAndDropState && !transfer?.transfer}
            data-cluster-slot="true"
          >
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
  dragAndDropState: PropTypes.oneOf(['grabbed', 'awaiting', null]),
  onSlotGrab: PropTypes.func.isRequired,
  onSlotDrop: PropTypes.func.isRequired,
  onDragCancel: PropTypes.func.isRequired,
};

export default Slot;
