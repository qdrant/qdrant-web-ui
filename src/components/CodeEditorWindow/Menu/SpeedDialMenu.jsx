import React from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import SpeedDial from "@mui/material/SpeedDial";
import Bolt from "@mui/icons-material/Bolt";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import SaveIcon from "@mui/icons-material/Save";
import HistoryRounded from "@mui/icons-material/HistoryRounded";

function SpeedDialMenu({ openSavedCode, openHistory }) {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Box sx={{ height: "90vh", transform: "translateZ(0px)", flexGrow: 1 }}>
      <SpeedDial
        ariaLabel="SpeedDial tooltip example"
        sx={{ position: "absolute", bottom: -10, right: 40 }}
        icon={<Bolt/>}
        onClose={handleClose}
        onOpen={handleOpen}
        open={open}
        onClick={handleOpen}
      >
        <SpeedDialAction
          key={"Save"}
          icon={<SaveIcon/>}
          tooltipTitle={"Save"}
          tooltipOpen
          onClick={openSavedCode}
        />
        <SpeedDialAction
          key={"History"}
          icon={<HistoryRounded/>}
          tooltipTitle={"History"}
          tooltipOpen
          onClick={openHistory}
        />
      </SpeedDial>
    </Box>
  );
}

// props validation
SpeedDialMenu.propTypes = {
  openSavedCode: PropTypes.func,
  openHistory: PropTypes.func,
};

export default SpeedDialMenu;