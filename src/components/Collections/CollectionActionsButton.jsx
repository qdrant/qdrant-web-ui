import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Menu, MenuItem } from '@mui/material';
import { ChevronDown } from 'lucide-react';

/**
 * Contained primary Actions button with a select menu for collection-level creates.
 *
 * @param {Object} props - component props
 * @param {boolean} props.hasMetadata - hides "Add Metadata" when metadata already exists
 * @param {function} props.onCreateAlias - called when Create Alias is chosen
 * @param {function} props.onAddMetadata - called when Add Metadata is chosen
 * @param {function} props.onCreatePayloadIndex - called when Create Payload Index is chosen
 * @return {JSX.Element} actions button with menu
 */
const CollectionActionsButton = ({ hasMetadata, onCreateAlias, onAddMetadata, onCreatePayloadIndex }) => {
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
        variant="contained"
        endIcon={<ChevronDown size={16} />}
        onClick={(e) => setAnchorEl(e.currentTarget)}
        aria-label="Actions"
        aria-controls={open ? 'collection-actions-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
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
      </Menu>
    </>
  );
};

CollectionActionsButton.propTypes = {
  hasMetadata: PropTypes.bool,
  onCreateAlias: PropTypes.func.isRequired,
  onAddMetadata: PropTypes.func.isRequired,
  onCreatePayloadIndex: PropTypes.func.isRequired,
};

export default CollectionActionsButton;
