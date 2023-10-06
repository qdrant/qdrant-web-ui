import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Link, useLocation } from 'react-router-dom';
import Tooltip from '@mui/material/Tooltip';
import { Accordion, AccordionDetails, AccordionSummary } from '../Common/Accordion';
import { ExpandMore, Lightbulb } from '@mui/icons-material';
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { getSectionFromLocationHash } from '../../lib/helpers';

export const SidebarTutorialSection = ({ isSidebarOpen }) => {
  const [expanded, setExpanded] = useState(getSectionFromLocationHash());
  const [accordionRightPosition] = useState('0');
  const location = useLocation();

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  useEffect(() => {
    setExpanded(getSectionFromLocationHash());
  }, [location]);

  return (
    <Accordion
      expanded={expanded === 'tutorial'}
      onChange={handleChange('tutorial')}
      sx={{
        position: 'absolute',
        left: 0,
        right: accordionRightPosition,
        transition: 'right 0.2s ease-in-out',
      }}
    >
      <Tooltip title={'Tutorial'} placement={'right'} arrow={true}>
        <div>
          {/* the div above needed to place the tooltip nicely. The `AccordionSummary` is a styled component and can not apply refs */}
          <AccordionSummary
            expandIcon={<ExpandMore />}
            aria-controls="panel1bh-content"
            id="panel1bh-header"
            sx={{
              '& .MuiAccordionSummary-expandIconWrapper': {
                display: isSidebarOpen ? 'flex' : 'none',
              },
            }}
          >
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
                sx={{ opacity: isSidebarOpen ? 1 : 0, display: isSidebarOpen ? 'block' : 'none' }}
              />
            </ListItemButton>
          </AccordionSummary>
        </div>
      </Tooltip>
      <AccordionDetails>
        <List sx={{ py: 0 }}>
          <ListItem key={'Quick Start'} disablePadding sx={{ display: 'block' }}>
            <Tooltip title={'Quick Start'} placement={'right'} arrow={true}>
              <ListItemButton
                sx={{
                  minHeight: 48,
                  justifyContent: isSidebarOpen ? 'initial' : 'center',
                  pr: 2.5,
                  pl: isSidebarOpen ? 5 : 2.5,
                }}
                component={Link}
                to="/tutorial/quickstart"
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: isSidebarOpen ? 3 : 'auto',
                    justifyContent: 'center',
                  }}
                >
                  <Box sx={{ width: '24px', textAlign: 'center' }}>1.</Box>
                </ListItemIcon>
                <ListItemText primary={'Quick Start'} sx={{ opacity: isSidebarOpen ? 1 : 0 }} />
              </ListItemButton>
            </Tooltip>
          </ListItem>
          <ListItem key={'Another page'} disablePadding sx={{ display: 'block' }}>
            <Tooltip title={'Another page'} placement={'right'} arrow={true}>
              <ListItemButton
                sx={{
                  minHeight: 48,
                  justifyContent: isSidebarOpen ? 'initial' : 'center',
                  pr: 2.5,
                  pl: isSidebarOpen ? 5 : 2.5,
                }}
                component={Link}
                to="/tutorial/another-page"
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: isSidebarOpen ? 3 : 'auto',
                    justifyContent: 'center',
                  }}
                >
                  <Box sx={{ width: '24px', textAlign: 'center' }}>2.</Box>
                </ListItemIcon>
                <ListItemText primary={'Another page'} sx={{ opacity: isSidebarOpen ? 1 : 0 }} />
              </ListItemButton>
            </Tooltip>
          </ListItem>
        </List>
      </AccordionDetails>
    </Accordion>
  );
};

SidebarTutorialSection.propTypes = {
  isSidebarOpen: PropTypes.bool.isRequired,
};
export default SidebarTutorialSection;
