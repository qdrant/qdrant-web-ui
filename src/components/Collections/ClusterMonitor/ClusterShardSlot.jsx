import React, { memo } from 'react';
import { ArcherElement } from 'react-archer';
import PropTypes from 'prop-types';
import { Typography } from '@mui/material';
import { StyledShardSlot } from './StyledComponents/StyledShardSlot';
import { slotTooltipAttributes } from './SlotTooltip';
import TransferProgressMarker from './TransferProgressMarker';
import { areSlotPropsEqual } from './helpers';

/**
 * Where arrows between neighboring peers start and end: this far inside the slot
 * from its edge facing the other peer. The gap between neighboring columns alone
 * is too short to show the arrow and its progress marker.
 */
const NEIGHBOR_ARROW_INSET = 'min(30%, 24px)';

/**
 * Legend component to explain the status of shards in the cluster.
 * @param {number} id - The id of the slot.
 * @param {number} currentPeerId - The id of the current peer.
 * @param {object} shard - The shard object.
 * @param {object} transfer - The transfer object.
 * @param {boolean} isArrowEnd - Whether a transfer arrow starts or ends at this slot.
 * @param {?('left'|'right')} innerAnchor - Side of the anchor inside the slot for an arrow from or to a neighboring peer.
 * @param {?('up'|'down')} rowDirection - For a transfer within the peer: whether its target row is above or below.
 * @param {number} peersNumber - The number of peers.
 * @param {boolean} compactLabels - Narrow slots (small screens or many peers): shorter labels, smaller transfer marker.
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
  innerAnchor = null,
  isArrowEnd = false,
  rowDirection = null,
  peersNumber,
  compactLabels = false,
  dragAndDropState,
  onSlotGrab,
  onSlotDrop,
  onDragCancel,
}) => {
  const relations = [];
  if (transfer?.transfer) {
    let targetAnchorDirection;
    let sourceAnchorDirection;

    const targetShardId = transfer.transfer.to_shard_id ?? transfer.transfer.shard_id;

    if (transfer.transfer.to === transfer.transfer.from) {
      // Same peer transfer — use top/bottom anchors based on visual row position
      if (rowDirection === 'up') {
        sourceAnchorDirection = 'top';
        targetAnchorDirection = 'bottom';
      } else {
        sourceAnchorDirection = 'bottom';
        targetAnchorDirection = 'top';
      }
    } else if (transfer.transfer.to > transfer.transfer.from) {
      targetAnchorDirection = 'left';
      sourceAnchorDirection = 'right';
    } else {
      targetAnchorDirection = 'right';
      sourceAnchorDirection = 'left';
    }

    const targetSlotId = `${transfer.transfer.to}-${targetShardId}`;
    relations.push({
      targetId: transfer.toNeighbor ? `${targetSlotId}-inner` : targetSlotId,
      targetAnchor: targetAnchorDirection,
      sourceAnchor: sourceAnchorDirection,
      // Rendered in the middle of the arrow.
      label: <TransferProgressMarker transfer={transfer.transfer} compact={compactLabels} />,
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

  const slot = (
    <div style={{ position: 'static' }}>
      <StyledShardSlot
        state={shard ? shard.state.toLowerCase() : 'empty'}
        dragAndDropState={dragAndDropState}
        isTransferring={!!transfer?.transfer}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onDragEnd={handleDragEnd}
        draggable={shard && shard.state === 'Active' && !dragAndDropState && !transfer?.transfer}
        data-cluster-slot="true"
        {...slotTooltipAttributes({
          peerId: currentPeerId,
          slotId: id,
          shard,
          transferTo: transfer?.transfer?.to,
          isDropTarget: dragAndDropState === 'awaiting',
        })}
      >
        {shard && (
          <Typography variant="subtitle2" sx={{ textAlign: 'center', fontWeight: 'bold' }}>
            {`${!compactLabels ? 'Shard' : ''} ${shard.shard_id}`}
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
        {innerAnchor && (
          <ArcherElement id={`${currentPeerId}-${id}-inner`} relations={transfer?.toNeighbor ? relations : []}>
            <span
              aria-hidden="true"
              style={{ position: 'absolute', top: '50%', [innerAnchor]: NEIGHBOR_ARROW_INSET, width: 0, height: 0 }}
            />
          </ArcherElement>
        )}
      </StyledShardSlot>
    </div>
  );

  // Only slots with an arrow are registered with react-archer: it measures every
  // registered element whenever arrows may have moved, and large clusters have
  // thousands of slots.
  if (!isArrowEnd) return slot;
  return (
    <ArcherElement id={`${currentPeerId}-${id}`} relations={transfer?.toNeighbor ? [] : relations}>
      {slot}
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
      method: PropTypes.string,
      comment: PropTypes.string,
    }),
    toNeighbor: PropTypes.bool,
  }),
  innerAnchor: PropTypes.oneOf(['left', 'right', null]),
  isArrowEnd: PropTypes.bool,
  rowDirection: PropTypes.oneOf(['up', 'down', null]),
  peersNumber: PropTypes.number,
  compactLabels: PropTypes.bool,
  dragAndDropState: PropTypes.oneOf(['grabbed', 'awaiting', null]),
  onSlotGrab: PropTypes.func.isRequired,
  onSlotDrop: PropTypes.func.isRequired,
  onDragCancel: PropTypes.func.isRequired,
};

export default memo(Slot, areSlotPropsEqual);
