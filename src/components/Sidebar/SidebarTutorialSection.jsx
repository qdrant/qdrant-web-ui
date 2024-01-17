import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Link, useLocation } from 'react-router-dom';
import Tooltip from '@mui/material/Tooltip';
import { ExpandLess, ExpandMore, Lightbulb } from '@mui/icons-material';
import { Collapse, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import tutorialSubPages from '../InteractiveTutorial/TutorialSubpages';

const TutorialsList = tutorialSubPages.map((page) => {
  const [slug, pageObject] = page;
  return (
    <ListItem key={slug} disablePadding sx={{ display: 'block' }}>
      <Tooltip title={pageObject.title} placement={'right'} arrow={true}>
        <ListItemButton
          sx={{
            minHeight: 48,
            justifyContent: 'initial',
            pr: 2.5,
            pl: 5,
          }}
          component={Link}
          to={`/tutorial/${slug}`}
        >
          <ListItemText primary={pageObject.title} />
        </ListItemButton>
      </Tooltip>
    </ListItem>
  );
});

export const SidebarTutorialSection = ({ isSidebarOpen }) => {
  const [collapsed, setCollapsed] = useState(window.location.hash.includes('tutorial'));
  const location = useLocation();

  const handleChange = (e) => {
    e.preventDefault();
    setCollapsed(!collapsed);
  };

  useEffect(() => {
    setCollapsed(!window.location.hash.includes('tutorial'));
  }, [location]);

  return (
    <>
      <Tooltip title={'Tutorial'} placement={'right'} arrow={true}>
        <ListItemButton
          sx={{
            minHeight: 48,
            justifyContent: isSidebarOpen ? 'initial' : 'center',
            px: 2.5,
          }}
          component={Link}
          to="/tutorial"
        >
          <ListItemIcon
            sx={{
              minWidth: 0,
              mr: isSidebarOpen ? 3 : 'auto',
              justifyContent: 'center',
            }}
          >
            <Lightbulb />
          </ListItemIcon>
          <ListItemText
            primary={'Tutorial'}
            sx={{
              opacity: isSidebarOpen ? 1 : 0,
              display: isSidebarOpen ? 'block' : 'none',
            }}
          />
          {isSidebarOpen && (collapsed ? <ExpandMore onClick={handleChange} /> : <ExpandLess onClick={handleChange} />)}
        </ListItemButton>
      </Tooltip>
      {isSidebarOpen && (
        <Collapse in={!collapsed} timeout="auto" unmountOnExit>
          <List sx={{ py: 0 }}>{TutorialsList}</List>
        </Collapse>
      )}
    </>
  );
};

SidebarTutorialSection.propTypes = {
  isSidebarOpen: PropTypes.bool.isRequired,
};
export default SidebarTutorialSection;
