/* eslint-disable react/prop-types */
import React from "react";
import { Link } from "react-router-dom";
import {
  Divider,
  Drawer,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { Logo } from "../components/Logo";
import { Stack } from "@mui/material";
import TerminalIcon from "@mui/icons-material/Terminal";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import Typography from "@mui/material/Typography";
import { useTheme } from '@mui/material/styles';


const drawerWidth = 240;

export default function Sidebar({ open, version = "???" }) {
  const theme = useTheme();


  return (
    <>
      <Grid item xs={2}>
        <Drawer
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              background: theme.palette.background.default,
            },
          }}
          variant="persistent"
          anchor="left"
          open={open}
        >
          <Stack dir="col" style={{ marginLeft: "50px", marginTop: "10px" }}>
            <Logo width={200} />
          </Stack>

          <br />
          <Divider />
          <List>
            <ListItemButton key={"Console"} component={Link} to="/console">
              <ListItemIcon>
                <TerminalIcon />
              </ListItemIcon>
              <ListItemText primary={"Console"} />
            </ListItemButton>
            <ListItemButton
              key={"Collections"}
              component={Link}
              to="/collections"
            >
              <ListItemIcon>
                <LibraryBooksIcon />
              </ListItemIcon>
              <ListItemText primary={"Collections"} />
            </ListItemButton>
          </List>
          <List style={{ marginTop: `auto` }} >
            <ListItem>
              <Typography variant="caption" >Qdrant v{version}</Typography>
            </ListItem>
          </List>
        </Drawer>
      </Grid>
    </>
  );
}
