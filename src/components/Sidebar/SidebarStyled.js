import { styled, alpha } from '@mui/material/styles';
import MuiDrawer from '@mui/material/Drawer';
import { List, ListItem, ListItemButton, Typography } from '@mui/material';

const drawerWidth = 240;

export const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

export const Drawer = styled(MuiDrawer)(() => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    overflowX: 'hidden',
  },
}));

export const StyledListItemButton = styled(ListItemButton, {
  shouldForwardProp: (prop) => prop !== 'isActive',
})(({ theme, isActive }) => ({
  display: 'flex',
  height: '40px',
  padding: '8px 12px',
  justifyContent: 'space-between',
  alignItems: 'center',
  alignSelf: 'stretch',
  borderRadius: '8px',
  '& .MuiListItemText-primary, & .MuiListItemIcon-root': {
    color: theme.palette.text.secondary,
  },
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.light, 0.05),
  },
  ...(isActive && {
    backgroundColor: alpha(theme.palette.primary.light, 0.08),
    '& .MuiListItemIcon-root': {
      color: theme.palette.primary.main,
    },
    '& .MuiListItemText-primary': {
      color: theme.palette.text.primary,
    },
  }),
}));

export const StyledList = styled(List)(() => ({
  display: 'flex',
  padding: '24px 12px 0 12px',
  flexDirection: 'column',
  alignItems: 'flex-start',
  flex: '1 0 0',
  alignSelf: 'stretch',
}));

export const StyledSidebarFooterListItem = styled(ListItem)(() => ({
  display: 'flex',
  padding: '0.5rem 0.75rem',
  justifyContent: 'flex-start',
  alignItems: 'center',
  gap: '0.75rem',
  alignSelf: 'stretch',
  '& a': {
    textDecoration: 'none',
    '&:hover': { 
      textDecoration: 'underline',
      textDecorationThickness: '1px',
      textUnderlineOffset: '2px',
     },
  },
}));

export const StyledSidebarFooterText = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontFeatureSettings: "'ss01' on, 'ss05' on, 'ss06' on, 'liga' off, 'clig' off",
  fontFamily: 'Mona Sans, sans-serif',
  fontSize: '12px',
  fontStyle: 'normal',
  fontWeight: 400,
  lineHeight: '150%',
}));

export const StyledSidebarFooterList = styled(List)(({ theme }) => ({
  marginTop: 'auto',
  borderTop: `1px solid ${theme.palette.divider}`,
  padding: '1rem',
}));
