import React, { useEffect, useState } from "react";
import { Link, Outlet } from 'react-router-dom';
import { styled, useTheme } from '@mui/material/styles';
import { getCollections } from '../common/client';
import { Divider, Drawer, FormControl, TextField, Grid, IconButton, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import { Logo } from "../components/Logo";
import { Stack, Button } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Typography } from '@mui/material';
import Dataset from "@mui/icons-material/Dataset";
import { purple } from '@mui/material/colors';


const StyledLink = styled(Link)`
  color: black;
  text-decoration: none;
  margin: 1rem;
  position: relative;
`;

const drawerWidth = 240;
const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));


const ColorButton = styled(Button)(({ theme }) => ({
  color: theme.palette.getContrastText(purple[500]),
  backgroundColor: "#DC244C",
  '&:hover': {
    backgroundColor: '#24386C',
  },
}));

export default function Sidebar({ open, handleDrawerClose }) {
  // const [drives, setDrives] = useState({});
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const theme = useTheme();
  const [collectionDetails, setCollectionDetails] = useState({});
  const [filter, setFilter] = useState("");
  const [openCreateCollectionModal, setOpenCreateCollectionModal] = useState(false);


  const [collections, setCollections] = useState([]);

  useEffect(() => {
    getCollections().then((response) => {
      setCollections(response.collections);
    });
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFilter(value)
  }


  const collectionsData = collections.filter((collection) => {
    if (filter == "")
      return collection
    else if (collection.name.toLowerCase().includes(filter.toLowerCase())) {
      return collection
    }
  }).map(collection => {
    return (
      <StyledLink to={`/collections/${collection.name}`}>
        <ListItem button key={collection.name}>
          <ListItemIcon>
            <Dataset />
          </ListItemIcon>
          <ListItemText primary={collection.name} />
        </ListItem>
      </StyledLink>
    )
  })

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
          <Typography

            style={{
              paddingTop: "10px",
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between"
            }}
          >
            <Stack
              dir="col"
              style={{ marginLeft: "50px", marginTop: "10px" }}
            >
              <Logo
                width={200}
                padding={5}
              />
            </Stack>
            <DrawerHeader>
              <IconButton onClick={handleDrawerClose}>
                <MenuIcon style={{ fontSize: "30px" }} />
              </IconButton>
            </DrawerHeader>
          </Typography>
          <br />
          <Divider />
          <List>
            <StyledLink to={`/console`}>
              <ListItem button key={"Console"}>
                <ListItemIcon>
                  <Dataset />
                </ListItemIcon>
              <ListItemText primary={"Console"} />
              </ListItem>
            </StyledLink>
          </List>
        </Drawer>
      </Grid>

    </>
  );
}