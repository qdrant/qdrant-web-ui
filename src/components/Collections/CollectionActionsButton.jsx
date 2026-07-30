import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Menu, MenuItem } from '@mui/material';
import { ChevronDown } from 'lucide-react';

/**
 * Contained primary Actions button with a select menu for collection-level actions.
 *
 * @param {Object} props - component props
 * @param {boolean} props.hasMetadata - hides "Add Metadata" when metadata already exists
 * @param {function} props.onCreateAlias - called when Create Alias is chosen
 * @param {function} props.onAddMetadata - called when Add Metadata is chosen
 * @param {function} props.onCreatePayloadIndex - called when Create Payload Index is chosen
 * @param {function} props.onTriggerOptimizers - called when Trigger Optimizers is chosen
 * @param {boolean} [props.triggerOptimizersDisabled=false] - disables Trigger Optimizers
 * @return {JSX.Element} actions button with menu
 */
const CollectionActionsButton = ({
  hasMetadata,
  onCreateAlias,
  onAddMetadata,
  onCreatePayloadIndex,
  onTriggerOptimizers,
  triggerOptimizersDisabled = false,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClose = () => setAnchorEl(null);

  const handleSelect = (action) => {
    handleClose();
    action?.();
  };

  return (
    <>
      <Button
        variant="outlined"
        size="small"
        endIcon={<ChevronDown size={16} />}
        onClick={(e) => setAnchorEl(e.currentTarget)}
        aria-label="Actions"
        aria-controls={open ? 'collection-actions-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        sx={{ py: 0.75, mb: 0.2 }}
      >
        Actions
      </Button>
      <Menu
        id="collection-actions-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={() => handleSelect(onCreateAlias)}>Create Alias</MenuItem>
        {!hasMetadata && <MenuItem onClick={() => handleSelect(onAddMetadata)}>Add Metadata</MenuItem>}
        <MenuItem onClick={() => handleSelect(onCreatePayloadIndex)}>Create Payload Index</MenuItem>
        <MenuItem onClick={() => handleSelect(onTriggerOptimizers)} disabled={triggerOptimizersDisabled}>
          Trigger Optimizers
        </MenuItem>
      </Menu>
    </>
  );
};

CollectionActionsButton.propTypes = {
  hasMetadata: PropTypes.bool,
  onCreateAlias: PropTypes.func.isRequired,
  onAddMetadata: PropTypes.func.isRequired,
  onCreatePayloadIndex: PropTypes.func.isRequired,
  onTriggerOptimizers: PropTypes.func.isRequired,
  triggerOptimizersDisabled: PropTypes.bool,
};

export default CollectionActionsButton;
