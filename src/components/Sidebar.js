/* eslint-disable react/prop-types */
import React from "react";
import { Link } from 'react-router-dom';
import { Divider, Drawer, Grid, List, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { Logo } from "../components/Logo";
import { Stack } from '@mui/material';
import TerminalIcon from '@mui/icons-material/Terminal';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';


const drawerWidth = 240;

export default function Sidebar({ open }) {

  return (
    <>
      <Grid item xs={2}>
        <Drawer
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              background: 'white',
            },
          }}
          variant="persistent"
          anchor="left"
          open={open}
        >
          <Stack
            dir="col"
            style={{ marginLeft: "50px", marginTop: "10px" }}
          >
            <Logo width={200} />
          </Stack>

          <br />
          <Divider />
          <List>
            <ListItemButton key={"Console"} component={Link} to='/console'>
              <ListItemIcon>
                <TerminalIcon />
              </ListItemIcon>
              <ListItemText primary={"Console"} />
            </ListItemButton>
            <ListItemButton key={"Collections"} component={Link} to='/collections'>
              <ListItemIcon>
                <LibraryBooksIcon />
              </ListItemIcon>
              <ListItemText primary={"Collections"} />
            </ListItemButton>
          </List>
        </Drawer>
      </Grid>

    </>
  );
}