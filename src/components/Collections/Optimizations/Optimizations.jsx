import React, { memo, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { MOCK_DATA } from './Tree/constants';
import { MOCK_DATA as timelineData, MOCK_REQUEST_TIME as timelineRequestTime } from './Timeline/mock';
import Timeline from './Timeline/Timeline';
import OptimizationsTree from './Tree/OptimizationsTree';

// todo: update the current implementation of the timeline and tree components to support the following:
// - when user clicks on a timeline item
//   - this item should stay highlighted until other item is clicked
//   - this item should be passed to the OptimizationsTree component as an input

const Optimizations = ({ collectionName }) => {
  const [data, setData] = useState(null);
  const [selectedOptimization, setSelectedOptimization] = useState(null);

  useEffect(() => {
    // Mock API call
    const timer = setTimeout(() => {
      setData(MOCK_DATA);
    }, 500);
    return () => clearTimeout(timer);
  }, [collectionName]);

  const handleOptimizationSelect = (optimization) => {
    // if clicking the same one, maybe deselect? or just keep it.
    // Spec says "stay highlighted until other item is clicked", so just set it.
    // But if we want to support deselecting, we could check if it's the same.
    // For now, simple selection.

    // The Tree component expects the full result structure or similar.
    // If optimization is a specific segment, we might need to wrap it
    // or the Tree needs to handle a subtree.
    // Looking at MOCK_DATA in OptimizationsTree, it expects { result: { ongoing: [...] } }
    // The timeline item is one of the items in 'ongoing' or 'completed'.
    // We will pass it directly, and update OptimizationsTree to handle it if needed.
    // Actually, let's just pass the selected item as `selectedData` or `rootNode` to the tree?
    // Or if `data` is the full tree, `selectedOptimization` is just a highlight filter?
    // "passed to the OptimizationsTree component as an input" implies it might replace the data shown.

    // Let's assume for now we pass it as `data` prop override or a new prop.
    // Since `data` state is currently just MOCK_DATA (the full tree),
    // we can derive the tree data from the selection.

    if (optimization) {
      // Wrap it in the structure expected by OptimizationsTree if necessary,
      // or update OptimizationsTree to accept a node.
      // The mock data has structure { result: { ongoing: [...] } }.
      // The selected optimization is a single node (which may have children).
      // We'll construct a compatible object.
      setSelectedOptimization({ result: { ongoing: [optimization] } });
    } else {
      setSelectedOptimization(null);
    }
  };

  return (
    <Box display="flex" flexDirection="column" gap={5}>
      <Timeline
        data={timelineData}
        requestTime={timelineRequestTime}
        onSelect={handleOptimizationSelect}
        selectedItem={selectedOptimization?.result?.ongoing?.[0]}
      />
      <OptimizationsTree data={selectedOptimization || data} />
    </Box>
  );
};

Optimizations.propTypes = {
  collectionName: PropTypes.string.isRequired,
};

export default memo(Optimizations);
