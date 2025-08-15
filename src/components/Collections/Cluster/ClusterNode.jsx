import React from 'react';
import PropTypes from 'prop-types';
import Slot from './ClusterShardSlot';
import { StyledNode } from './StyledComponents/StyledNode';

const ClusterNode = ({ peerId, cluster, dragState, onSlotGrab, onSlotDrop, onDragCancel }) => {
  const maxSlotsIndex = cluster.shards.reduce((max, shard) => {
    return Math.max(max, shard.shard_id);
  }, 0);
  const minSlotsIndex = cluster.shards.reduce((min, shard) => {
    return Math.min(min, shard.shard_id);
  }, maxSlotsIndex);

  const numSlots = cluster.shards.length;

  const shards = cluster.shards.filter((shard) => shard.peer_id === peerId);

  return (
    <StyledNode>
      {(numSlots &&
        Array.from({ length: maxSlotsIndex - minSlotsIndex + 1 }, (_, i) => {
          const idx = minSlotsIndex + i;
          const shard = shards.find((s) => s.shard_id === idx);
          let transfer;
          if (shard) {
            const foundTransfer = cluster.shard_transfers.find(
              (transfer) => transfer.shard_id === shard.shard_id && transfer.from === peerId
            );
            transfer = {
              transfer: foundTransfer,
            };
          }

          // Determine drag and drop state for this slot
          let dragAndDropState = null;
          if (dragState.isDragging) {
            if (dragState.draggedSlot.peerId === peerId && dragState.draggedSlot.slotId === idx) {
              dragAndDropState = 'grabbed';
            } else if (!shard) {
              dragAndDropState = 'awaiting';
            }
          }

          return (
            <Slot
              id={idx}
              key={`${peerId}-${idx}`}
              currentPeerId={peerId}
              shard={shard}
              transfer={transfer}
              peersNumber={cluster?.peers.length}
              dragAndDropState={dragAndDropState}
              onSlotGrab={onSlotGrab}
              onSlotDrop={onSlotDrop}
              onDragCancel={onDragCancel}
            />
          );
        })) || <div>No slots available</div>}
    </StyledNode>
  );
};

ClusterNode.propTypes = {
  peerId: PropTypes.number.isRequired,
  cluster: PropTypes.shape({
    shards: PropTypes.array.isRequired,
    shard_transfers: PropTypes.arrayOf(
      PropTypes.shape({
        shard_id: PropTypes.number,
        from: PropTypes.number,
        to: PropTypes.number,
      })
    ),
    peers: PropTypes.arrayOf(PropTypes.number),
  }).isRequired,
  dragState: PropTypes.shape({
    isDragging: PropTypes.bool.isRequired,
    draggedSlot: PropTypes.object,
  }).isRequired,
  onSlotGrab: PropTypes.func.isRequired,
  onSlotDrop: PropTypes.func.isRequired,
  onDragCancel: PropTypes.func.isRequired,
};

export default ClusterNode;
