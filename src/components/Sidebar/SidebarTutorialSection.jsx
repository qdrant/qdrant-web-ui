import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Link, useLocation } from "react-router-dom";
import Tooltip from "@mui/material/Tooltip";
import { ExpandLess, ExpandMore, Lightbulb } from "@mui/icons-material";
import {
  Box,
  Collapse,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { getSectionFromLocationHash } from "../../lib/helpers";

export const SidebarTutorialSection = ({ isSidebarOpen }) => {
  const isOnTutorialPage = getSectionFromLocationHash === "tutorial";
  const [collapsed, setCollapsed] = useState(isOnTutorialPage);
  const location = useLocation();

  const handleChange = (e) => {
    e.preventDefault();
    setCollapsed(!collapsed);
  };

  useEffect(() => {
    setCollapsed(getSectionFromLocationHash() !== "tutorial");
  }, [location]);

  return (
    <>
      <Tooltip title={"Tutorial"} placement={"right"} arrow={true}>
        <ListItemButton
          sx={{
            minHeight: 48,
            justifyContent: isSidebarOpen ? "initial" : "center",
            px: 2.5,
          }}
          component={Link}
          to="/tutorial"
        >
          <ListItemIcon
            sx={{
              minWidth: 0,
              mr: isSidebarOpen ? 3 : "auto",
              justifyContent: "center",
            }}
          >
            <Lightbulb/>
          </ListItemIcon>
          <ListItemText
            primary={"Tutorial"}
            sx={{
              opacity: isSidebarOpen ? 1 : 0,
              display: isSidebarOpen ? "block" : "none",
            }}
          />
          {isSidebarOpen && (collapsed ?
            <ExpandLess onClick={handleChange}/>
            :
            <ExpandMore onClick={handleChange}/>)}
        </ListItemButton>
      </Tooltip>
      {isSidebarOpen &&
        <Collapse in={!collapsed} timeout="auto" unmountOnExit>
          <List sx={{ py: 0 }}>
            <ListItem key={"Quick Start"} disablePadding
                      sx={{ display: "block" }}>
              <Tooltip title={"Quick Start"} placement={"right"} arrow={true}>
                <ListItemButton
                  sx={{
                    minHeight: 48,
                    justifyContent: isSidebarOpen ? "initial" : "center",
                    pr: 2.5,
                    pl: isSidebarOpen ? 5 : 2.5,
                  }}
                  component={Link}
                  to="/tutorial/quickstart"
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: isSidebarOpen ? 3 : "auto",
                      justifyContent: "center",
                    }}
                  >
                    <Box sx={{ width: "24px", textAlign: "center" }}>1.</Box>
                  </ListItemIcon>
                  <ListItemText primary={"Quick Start"}
                                sx={{ opacity: isSidebarOpen ? 1 : 0 }}/>
                </ListItemButton>
              </Tooltip>
            </ListItem>
            <ListItem key={"Another page"} disablePadding
                      sx={{ display: "block" }}>
              <Tooltip title={"Another page"} placement={"right"} arrow={true}>
                <ListItemButton
                  sx={{
                    minHeight: 48,
                    justifyContent: isSidebarOpen ? "initial" : "center",
                    pr: 2.5,
                    pl: isSidebarOpen ? 5 : 2.5,
                  }}
                  component={Link}
                  to="/tutorial/another-page"
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: isSidebarOpen ? 3 : "auto",
                      justifyContent: "center",
                    }}
                  >
                    <Box sx={{ width: "24px", textAlign: "center" }}>2.</Box>
                  </ListItemIcon>
                  <ListItemText primary={"Another page"}
                                sx={{ opacity: isSidebarOpen ? 1 : 0 }}/>
                </ListItemButton>
              </Tooltip>
            </ListItem>
          </List>
        </Collapse>
      }
    </>
  );
};

SidebarTutorialSection.propTypes = {
  isSidebarOpen: PropTypes.bool.isRequired,
};
export default SidebarTutorialSection;
