import React from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import Slot from './ClusterShardSlot';

const ClusterNode = ({ peerId, cluster, slotIndices, dragState, onSlotGrab, onSlotDrop, onDragCancel }) => {
  const shards = cluster.shards.filter((shard) => shard.peer_id === peerId);
  const transfers = cluster.shard_transfers || [];

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
      }}
    >
      {slotIndices.length > 0 ? (
        slotIndices.map((idx) => {
          const shard = shards.find((s) => s.shard_id === idx);
          let transfer;
          if (shard) {
            const foundTransfer = transfers.find((t) => t.shard_id === shard.shard_id && t.from === peerId);
            transfer = { transfer: foundTransfer };
          }

          let dragAndDropState = null;
          if (dragState.isDragging) {
            if (dragState.draggedSlot.peerId === peerId && dragState.draggedSlot.slotId === idx) {
              dragAndDropState = 'grabbed';
            } else if (!shard && dragState.draggedSlot.slotId === idx) {
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
              slotIndices={slotIndices}
              peersNumber={cluster?.peers.length}
              dragAndDropState={dragAndDropState}
              onSlotGrab={onSlotGrab}
              onSlotDrop={onSlotDrop}
              onDragCancel={onDragCancel}
            />
          );
        })
      ) : (
        <div>No slots available</div>
      )}
    </Box>
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
  slotIndices: PropTypes.arrayOf(PropTypes.number).isRequired,
  dragState: PropTypes.shape({
    isDragging: PropTypes.bool.isRequired,
    draggedSlot: PropTypes.object,
  }).isRequired,
  onSlotGrab: PropTypes.func.isRequired,
  onSlotDrop: PropTypes.func.isRequired,
  onDragCancel: PropTypes.func.isRequired,
};

export default ClusterNode;
