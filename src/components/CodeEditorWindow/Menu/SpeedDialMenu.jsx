import React, { memo, useState } from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import SaveIcon from "@mui/icons-material/Save";
import HistoryRounded from "@mui/icons-material/HistoryRounded";
import History from "./history";
// import SavedCode from "./savedCode";

const actions = [
  { icon: <SaveIcon/>, name: "Save", action: "savedCode" },
  { icon: <HistoryRounded/>, name: "History", action: "history" },
];

function SpeedDialMenu({code, handleEditorChange}) {
  // todo: reduce unnecessary re-renders of this and child components
  console.log("SpeedDialMenu render");
  const [open, setOpen] = React.useState(false);
  const [openHistory, setOpenHistory] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleAction = (action) => {
    switch (action) {
      case "savedCode":
        // setOpenSavedCode(true);
        break;
      case "history":
        setOpenHistory(true);
        break;
      default:
        break;
    }
  };

  return (
    <Box sx={{ height: "90vh", transform: "translateZ(0px)", flexGrow: 1 }}>
      {/*<Backdrop open={open}/>*/}
      <SpeedDial
        ariaLabel="SpeedDial tooltip example"
        sx={{ position: "absolute", bottom: 16, right: 16 }}
        icon={<SpeedDialIcon/>}
        onClose={handleClose}
        onOpen={handleOpen}
        open={open}
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            tooltipOpen
            onClick={() => handleAction(action.action)}
          />
        ))}
      </SpeedDial>
      <React.Fragment key="history">
      <History
        code={code}
        handleEditorChange={handleEditorChange}
        open={openHistory}
        onClose={() => setOpenHistory(false)}/>
      </React.Fragment>
    </Box>
  );
}

// props validation
SpeedDialMenu.propTypes = {
  code: PropTypes.string,
  handleEditorChange: PropTypes.func,
};

export default memo(SpeedDialMenu);