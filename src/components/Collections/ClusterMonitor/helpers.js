import { shallowEqual } from '../../../lib/common-helpers';

/**
 * Slots are compared by value: every poll brings new shard and transfer objects,
 * even for the (most) slots that did not change, and large clusters have
 * thousands of slots.
 * @param {Object} prev
 * @param {Object} next
 * @return {boolean}
 */
export const areSlotPropsEqual = (prev, next) =>
  Object.keys(next).every((key) => {
    if (key === 'shard') return shallowEqual(prev.shard, next.shard);
    if (key === 'transfer') {
      return (
        prev.transfer?.toNeighbor === next.transfer?.toNeighbor &&
        shallowEqual(prev.transfer?.transfer, next.transfer?.transfer)
      );
    }
    return prev[key] === next[key];
  }) && Object.keys(prev).length === Object.keys(next).length;
