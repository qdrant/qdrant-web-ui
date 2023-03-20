import * as React from 'react';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Toolbar from '@mui/material/Toolbar';
import ListItem from '@mui/material/ListItem';
import MenuIcon from '@mui/icons-material/Menu';
import MailIcon from '@mui/icons-material/Mail';
import Typography from '@mui/material/Typography';
import CssBaseline from '@mui/material/CssBaseline';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import useMediaQuery from '@mui/material/useMediaQuery';
import ListItemButton from '@mui/material/ListItemButton';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';

const theme = {
  palette: {
    primary: {
      light: '#8f939a',
      dark: 'rgb(18 18 19)'
    }
  }
}
const drawerWidth = 240;

function Home() {
  const matches = useMediaQuery('(max-width:600px)');

  const [state, setState] = React.useState({
    top: false,
    left: false,
    bottom: false,
    right: false,
  });

  const toggleDrawer = (anchor, open) => (event) => {
    if (
      event &&
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return;
    }
    setState({ ...state, [anchor]: open });
  };

  const list = (anchor) => (
    <Box
      sx={{ width: anchor === 'top' || anchor === 'bottom' ? 'auto' : 250 }}
      role="presentation"
      onClick={toggleDrawer(anchor, false)}
      onKeyDown={toggleDrawer(anchor, false)}
    >
      <List>
        {['Inbox', 'Starred', 'Send email', 'Drafts'].map((text, index) => (
          <ListItem key={text} disablePadding>
            <ListItemButton>
              <ListItemIcon>
                {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
              </ListItemIcon>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        {['All mail', 'Trash', 'Spam'].map((text, index) => (
          <ListItem key={text} disablePadding>
            <ListItemButton>
              <ListItemIcon>
                {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
              </ListItemIcon>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  let anchor = 'left'; // sidebar in mobile

  return (
    <>
      <Box sx={{ display: 'flex' , flexDirection: 'row', justifyContent: 'space-between', width: "100%" }}>
        <CssBaseline />
        { 
          !matches ?
            <Box
              anchor="left"
              sx={{
                width: drawerWidth,
                flexShrink: 0,
                [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
                zIndex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              {/* <Toolbar style={{ backgroundColor: theme.palette.primary.dark }} /> */}
              <Box sx={{  overflow: 'auto',
                          height: '100vh',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-evenly',
                          backgroundColor: theme.palette.primary.dark
                        }}
              >
                <List sx={{ color:    theme.palette.primary.light}}>
                  {['Inbox', 'Starred', 'Send email', 'Drafts'].map((text, index) => (
                    <ListItem key={text} disablePadding>
                      <ListItemButton>
                        <ListItemIcon sx={{ color: theme.palette.primary.light}}>
                          {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                        </ListItemIcon>
                        <ListItemText  primary={<Typography variant="body1" style={{ fontWeight: 700}}>{text}</Typography>} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
                <Divider />
                <List sx={{ color: theme.palette.primary.light}} >
                  {['All mail', 'Trash', 'Spam'].map((text, index) => (
                    <ListItem key={text} disablePadding>
                      <ListItemButton>
                        <ListItemIcon sx={{ color: theme.palette.primary.light}}>
                          {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                        </ListItemIcon>
                        <ListItemText  primary={<Typography variant="body1" style={{ fontWeight: 700}}>{text}</Typography>} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Box> 
          :
          <>
            <Button onClick={toggleDrawer(anchor, true)} style={{position: 'absolute', top: '60px'}}><MenuIcon/></Button>
            <SwipeableDrawer
              anchor={anchor}
              open={state[anchor]}
              onClose={toggleDrawer(anchor, false)}
              onOpen={toggleDrawer(anchor, true)}
            >
                {list(anchor)}
            </SwipeableDrawer>
          </>
        }
      
        <Box component="div" sx={{ display: 'flex', flexDirection: "column", justifyContent: 'space-between', minHeight: '100vh', width: '100%'}}>
          <Toolbar/>
          <Box component="main" sx={{display: 'flex', flexDirection:'column', justifyContent: 'center', alignItems: 'center'}}>
            <Box component="div"><Typography variant='h1'>Home</Typography></Box>
            <Link to="/collections" style={{ color: 'white', textDecoration: 'none'}}>Collections</Link>
          </Box>
          <Footer/>
        </Box>
      </Box>
    </>
  );
}

export default Home;