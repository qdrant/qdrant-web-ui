import React from "react";
import PropTypes from "prop-types";
import { Drawer, Typography } from "@mui/material";
import CommandsTable from "./CommandsTable";
import { commands } from "./commandsList";

const CommandsDrawer = ({ open, toggleDrawer }) => {
  return (
    <Drawer
      anchor={"right"}
      open={open}
      onClose={toggleDrawer}
      sx={{
        "& .MuiDrawer-paper": {
          width: "50vw",
          padding: "1rem",
          pt: "5rem",
        },
      }}
    >
      <div>
        <Typography variant={"h5"}>Commands</Typography>
        <Typography variant={"body1"}>This is a list of commands that can be
          used in the editor.</Typography>
        <CommandsTable commands={commands}/>
      </div>
    </Drawer>
  );
};

CommandsDrawer.propTypes = {
  open: PropTypes.bool.isRequired,
  toggleDrawer: PropTypes.func.isRequired,
};

export default CommandsDrawer;