import React, { memo, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Typography } from '@mui/material';
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
 * Data attributes a slot carries for the shared tooltip.
 * @param {Object} params
 * @param {number} params.peerId
 * @param {number} params.slotId
 * @param {?Object} params.shard
 * @param {?number} params.transferTo - peer the shard is being transferred to
 * @param {boolean} params.isDropTarget - an empty slot awaiting a dragged shard
 * @return {Object} props to spread on the slot element
 */
export const slotTooltipAttributes = ({ peerId, slotId, shard, transferTo, isDropTarget }) => ({
  'data-peer-id': peerId,
  'data-slot-id': slotId,
  'data-shard-state': shard?.state,
  'data-shard-key': shard?.shard_key ?? undefined,
  'data-transfer-to': transferTo ?? undefined,
  'data-drop-target': isDropTarget ? 'true' : undefined,
});

/** The attributes set by `slotTooltipAttributes`; a change of any of them updates the open tooltip. */
const SLOT_TOOLTIP_ATTRIBUTES = [
  'data-peer-id',
  'data-slot-id',
  'data-shard-state',
  'data-shard-key',
  'data-transfer-to',
  'data-drop-target',
];

const readSlotInfo = (element) => {
  const { peerId, slotId, shardState, shardKey, transferTo, dropTarget } = element.dataset;
  return { peerId, slotId, shardState, shardKey, transferTo, isDropTarget: dropTarget === 'true' };
};

const SlotTooltipContent = ({ info }) => {
  const { peerId, slotId, shardState, shardKey, transferTo, isDropTarget } = info;

  if (!shardState) {
    return (
      <>
        <TooltipRow label="Peer Id" value={peerId} />
        <br />
        <TooltipRow label="Slot Id" value={slotId} />
        <br />
        {isDropTarget ? (
          <Typography variant="caption" sx={{ color: 'common.white', fontWeight: 'bold' }}>
            Drop here to move shard
          </Typography>
        ) : (
          <Typography variant="caption">Empty slot</Typography>
        )}
      </>
    );
  }

  return (
    <>
      <TooltipRow label="Peer Id" value={peerId} />
      <br />
      {/* Slots are indexed by shard id. */}
      <TooltipRow label="Shard Id" value={slotId} />
      {shardKey && (
        <>
          <br />
          <TooltipRow label="Shard Key" value={shardKey} />
        </>
      )}
      <br />
      <TooltipRow label="Shard State" value={shardState} />
      {shardState === 'Active' && !transferTo && (
        <>
          <br />
          <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 'bold' }}>
            Drag to an empty slot to transfer
          </Typography>
        </>
      )}
      {transferTo && (
        <>
          <br />
          <Typography variant="caption" sx={{ color: 'warning.main', fontWeight: 'bold' }}>
            Transferring to peer {transferTo}
          </Typography>
          <br />
          <Typography variant="caption" sx={{ color: 'error.main', fontStyle: 'italic' }}>
            Cannot be dragged during transfer
          </Typography>
        </>
      )}
    </>
  );
};

SlotTooltipContent.propTypes = {
  info: PropTypes.shape({
    peerId: PropTypes.string,
    slotId: PropTypes.string,
    shardState: PropTypes.string,
    shardKey: PropTypes.string,
    transferTo: PropTypes.string,
    isDropTarget: PropTypes.bool,
  }).isRequired,
};

/**
 * One tooltip shared by all the slots of the cluster grid: it follows the slot
 * under the pointer and reads what to show from the slot's data attributes (see
 * `slotTooltipAttributes`). Large clusters have thousands of slots, and a tooltip
 * component per slot made rendering the grid slow. Hovering re-renders only this
 * component, not the grid.
 * @param {Object} props
 * @param {{current: ?HTMLElement}} props.containerRef - element containing the slots
 * @return {?React.JSX.Element}
 */
const SlotTooltip = ({ containerRef }) => {
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const handleMouseOver = (event) => {
      const slot = event.target.closest?.('[data-cluster-slot]');
      if (!slot || !container.contains(slot)) {
        setHovered(null);
        return;
      }
      setHovered((current) => {
        const info = readSlotInfo(slot);
        const unchanged =
          current?.element === slot && Object.keys(info).every((key) => info[key] === current.info[key]);
        return unchanged ? current : { element: slot, info };
      });
    };
    const handleMouseLeave = () => setHovered(null);

    // The grid can change under a still pointer (auto-refresh, a transfer starting or
    // finishing): refresh what is shown, and follow the slot if it was re-created.
    const handleMutations = () => {
      setHovered((current) => {
        if (!current) return current;
        let slot = current.element;
        if (!slot.isConnected) {
          const { peerId, slotId } = current.info;
          slot = container.querySelector(`[data-cluster-slot][data-peer-id="${peerId}"][data-slot-id="${slotId}"]`);
          if (!slot) return null;
        }
        const info = readSlotInfo(slot);
        const unchanged = slot === current.element && Object.keys(info).every((key) => info[key] === current.info[key]);
        return unchanged ? current : { element: slot, info };
      });
    };
    const observer = typeof MutationObserver === 'undefined' ? null : new MutationObserver(handleMutations);
    observer?.observe(container, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: SLOT_TOOLTIP_ATTRIBUTES,
    });

    container.addEventListener('mouseover', handleMouseOver);
    container.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      observer?.disconnect();
      container.removeEventListener('mouseover', handleMouseOver);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [containerRef]);

  // Safety net for a slot that left the page before the observer caught up.
  const anchor = hovered?.element.isConnected ? hovered : null;

  return (
    <StyledTooltip
      arrow
      placement="top"
      open={!!anchor}
      disableHoverListener
      disableFocusListener
      disableTouchListener
      title={anchor ? <SlotTooltipContent info={anchor.info} /> : ''}
      slotProps={{ popper: { anchorEl: anchor?.element } }}
    >
      <span style={{ display: 'none' }} />
    </StyledTooltip>
  );
};

SlotTooltip.propTypes = {
  containerRef: PropTypes.shape({ current: PropTypes.object }).isRequired,
};

export default memo(SlotTooltip);
