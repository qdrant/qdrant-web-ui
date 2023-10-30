import React from 'react';
import PropTypes from 'prop-types';
import SpeedDial from '@mui/material/SpeedDial';
import Bolt from '@mui/icons-material/Bolt';
import SpeedDialAction from '@mui/material/SpeedDialAction';

function SpeedDialMenu({ actions }) {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const actionsList = actions.map((action) => <SpeedDialAction
          key={action[0]}
          icon={action[2]}
          tooltipTitle={action[0]}
          tooltipOpen
          onClick={action[1]}
        />);

  return (
    <SpeedDial
      ariaLabel="SpeedDial tooltip example"
      sx={{ position: 'absolute', bottom: '40px', right: '40px' }}
      icon={<Bolt />}
      onClose={handleClose}
      onOpen={handleOpen}
      open={open}
      onClick={handleOpen}
    >
      {actionsList}
    </SpeedDial>
  );
}

// props validation
SpeedDialMenu.propTypes = {
  actions: PropTypes.arrayOf(
    PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.string, PropTypes.func, PropTypes.element]),
    ),
  ),
};

export default SpeedDialMenu;
