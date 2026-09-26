import React, { memo, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import Slot from './ClusterShardSlot';

const ClusterNode = ({
  peerId,
  cluster,
  slotIndices,
  compactLabels,
  dragState,
  onSlotGrab,
  onSlotDrop,
  onDragCancel,
}) => {
  const peers = cluster.peers || [];
  // Lookups by shard id: a peer can have up to 1,000 slots, and searching the
  // shard and transfer lists for each of them made rendering quadratic.
  const { shardsById, outgoingById, incomingById } = useMemo(() => {
    const byId = new Map();
    const outgoing = new Map();
    const incoming = new Map();
    // The first match wins, as with `Array.find`.
    const addFirst = (map, key, value) => {
      if (!map.has(key)) map.set(key, value);
    };
    cluster.shards.forEach((shard) => {
      if (shard.peer_id === peerId) addFirst(byId, shard.shard_id, shard);
    });
    (cluster.shard_transfers || []).forEach((t) => {
      if (t.from === peerId) addFirst(outgoing, t.shard_id, t);
      if (t.to === peerId) addFirst(incoming, t.to_shard_id ?? t.shard_id, t);
    });
    return { shardsById: byId, outgoingById: outgoing, incomingById: incoming };
  }, [cluster.shards, cluster.shard_transfers, peerId]);
  // Peers in neighboring columns of the grid; arrows between them are drawn from
  // anchors inside the slots, since the gap between the columns alone is too short.
  const areNeighbors = (a, b) => a !== b && Math.abs(peers.indexOf(a) - peers.indexOf(b)) === 1;

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
          const shard = shardsById.get(idx);
          let transfer;
          let innerAnchor = null;
          if (shard) {
            const foundTransfer = outgoingById.get(shard.shard_id);
            const toNeighbor = !!foundTransfer && areNeighbors(foundTransfer.from, foundTransfer.to);
            transfer = { transfer: foundTransfer, toNeighbor };
            if (toNeighbor) innerAnchor = foundTransfer.to > peerId ? 'right' : 'left';
          }
          const incoming = incomingById.get(idx);
          if (!innerAnchor && incoming && areNeighbors(incoming.from, incoming.to)) {
            innerAnchor = incoming.from > peerId ? 'right' : 'left';
          }
          // Only slots an arrow starts or ends at are registered with react-archer,
          // which measures every registered element whenever arrows may have moved.
          const isArrowEnd = !!transfer?.transfer || !!incoming;
          // A transfer within the peer points up or down, depending on the rows' order.
          let rowDirection = null;
          if (transfer?.transfer && transfer.transfer.to === transfer.transfer.from) {
            const targetShardId = transfer.transfer.to_shard_id ?? transfer.transfer.shard_id;
            rowDirection = slotIndices.indexOf(idx) > slotIndices.indexOf(targetShardId) ? 'up' : 'down';
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
              innerAnchor={innerAnchor}
              isArrowEnd={isArrowEnd}
              rowDirection={rowDirection}
              peersNumber={cluster?.peers.length}
              compactLabels={compactLabels}
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
  compactLabels: PropTypes.bool,
  dragState: PropTypes.shape({
    isDragging: PropTypes.bool.isRequired,
    draggedSlot: PropTypes.object,
  }).isRequired,
  onSlotGrab: PropTypes.func.isRequired,
  onSlotDrop: PropTypes.func.isRequired,
  onDragCancel: PropTypes.func.isRequired,
};

// Skips re-rendering the grid when the monitor re-renders for unrelated state (dialogs, loading flags, resizes).
export default memo(ClusterNode);
