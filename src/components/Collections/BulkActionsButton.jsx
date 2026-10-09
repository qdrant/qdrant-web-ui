import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Menu, MenuItem } from '@mui/material';
import { ChevronDown } from 'lucide-react';

const BulkActionsButton = ({ count, onDelete, onDownloadSnapshot }) => {
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
        aria-label={`Actions for ${count} selected collection(s)`}
        aria-controls={open ? 'bulk-actions-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
      >
        Actions ({count})
      </Button>
      <Menu
        id="bulk-actions-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={() => handleSelect(onDownloadSnapshot)}>Download Snapshot</MenuItem>
        <MenuItem onClick={() => handleSelect(onDelete)} sx={{ color: 'error.main' }}>
          Delete
        </MenuItem>
      </Menu>
    </>
  );
};

BulkActionsButton.propTypes = {
  count: PropTypes.number.isRequired,
  onDelete: PropTypes.func.isRequired,
  onDownloadSnapshot: PropTypes.func.isRequired,
};

export default BulkActionsButton;
