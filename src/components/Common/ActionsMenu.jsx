import React, { memo } from 'react';
import PropTypes from 'prop-types';
import Menu from '@mui/material/Menu';
import { IconButton } from '@mui/material';
import MoreVert from '@mui/icons-material/MoreVert';

// for better result use as children the components acceptable inside Menu component from MUI
// https://mui.com/material-ui/react-menu/
// but in general it can be any node elements
function ActionsMenu({ children, ...props }) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div {...props}>
      <IconButton
        id="basic-button"
        aria-controls={open ? 'actions-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
      >
        <MoreVert />
      </IconButton>

      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        {children}
      </Menu>
    </div>
  );
}

ActionsMenu.propTypes = {
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.node])), PropTypes.node]),
};

export default memo(ActionsMenu);
