import React from 'react';
import PropTypes from 'prop-types';
import SpeedDial from '@mui/material/SpeedDial';
import Bolt from '@mui/icons-material/Bolt';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import SaveIcon from '@mui/icons-material/Save';
import HistoryRounded from '@mui/icons-material/HistoryRounded';
import RestartAlt from '@mui/icons-material/RestartAlt';

function SpeedDialMenu({ openSavedCode, openHistory, resetConsole }) {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

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
      <SpeedDialAction key={'Save'} icon={<SaveIcon />} tooltipTitle={'Save'} tooltipOpen onClick={openSavedCode} />
      <SpeedDialAction
        key={'History'}
        icon={<HistoryRounded />}
        tooltipTitle={'History'}
        tooltipOpen
        onClick={openHistory}
      />
      <SpeedDialAction key={'Reset'} icon={<RestartAlt />} tooltipTitle={'Reset'} tooltipOpen onClick={resetConsole} />
    </SpeedDial>
  );
}

// props validation
SpeedDialMenu.propTypes = {
  openSavedCode: PropTypes.func,
  openHistory: PropTypes.func,
  resetConsole: PropTypes.func,
};

export default SpeedDialMenu;
