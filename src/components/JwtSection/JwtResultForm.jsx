import React from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  MenuItem,
  Select,
  TableCell,
  TableRow,
} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import { ArrowDropDown, Settings } from '@mui/icons-material';
import { TableBodyWithGaps, TableHeadWithGaps, TableWithGaps } from '../Common/TableWithGaps';
import DialogContentText from '@mui/material/DialogContentText';

function JwtResultForm() {
  const theme = useTheme();
  const headerHeight = 64;
  const [collection, setCollection] = React.useState('');
  const [expandedPoint, setExpandedPoint] = React.useState(null);
  const [settingsDialogOpen, setSettingsDialogOpen] = React.useState(false);
  const [settings, setSettings] = React.useState({});

  console.log(settings);
  const handleCollectionChange = (event) => {
    setCollection(event.target.value);
  };

  const handleTogglePoint = (id) => {
    if (expandedPoint === id) {
      setExpandedPoint(null);
    } else {
      setExpandedPoint(id);
    }
  };

  const handleSettingChange = (newSettings) => {
    setSettings(newSettings);
    setSettingsDialogOpen(false);
  };

  return (
    <Box
      sx={{
        background: theme.palette.mode === 'dark' ? theme.palette.background.code : theme.palette.background.code,
        height: `calc(100vh - ${headerHeight}px)`,
        p: 2,
        px: 5,
      }}
    >
      <TableWithGaps>
        <TableHeadWithGaps>
          <TableRow>
            <TableCell>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <FormControl sx={{ minWidth: 120, mt: -1, mb: -1 }}>
                  {/* <InputLabel*/}
                  {/*  id="collection-select-label">Collection</InputLabel>*/}
                  <Select
                    // labelId="collection-select-label"
                    id="collection-select"
                    value={collection}
                    displayEmpty
                    variant="outlined"
                    onChange={handleCollectionChange}
                    sx={{
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: 'none',
                      },
                    }}
                  >
                    <MenuItem value={''}>
                      <em>Collection</em>
                    </MenuItem>
                    <MenuItem value={10}>Demo</MenuItem>
                    <MenuItem value={20}>Test</MenuItem>
                    <MenuItem value={30}>Pictures</MenuItem>
                  </Select>
                </FormControl>
                <IconButton onClick={() => setSettingsDialogOpen(true)}>
                  <Settings />
                </IconButton>
              </Box>
            </TableCell>
          </TableRow>
        </TableHeadWithGaps>
        <TableBodyWithGaps>
          {/* todo: move to separate component, do not ducplicate code */}
          <TableRow sx={theme.palette.mode === 'light' ? { background: theme.palette.background.paper } : {}}>
            <TableCell>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                Id: 1
                <IconButton onClick={() => handleTogglePoint(1)}>
                  <ArrowDropDown />
                </IconButton>
              </Box>
              {expandedPoint === 1 && <Box>Here will be the payload</Box>}
            </TableCell>
          </TableRow>

          <TableRow sx={theme.palette.mode === 'light' ? { background: theme.palette.background.paper } : {}}>
            <TableCell>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                Id: 2
                <IconButton>
                  <ArrowDropDown />
                </IconButton>
              </Box>
            </TableCell>
          </TableRow>
        </TableBodyWithGaps>
      </TableWithGaps>
      <Dialog open={settingsDialogOpen} onClose={() => setSettingsDialogOpen(false)}>
        <DialogTitle>{'Settings'}</DialogTitle>
        <DialogContent>
          <DialogContentText>Change settings here</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsDialogOpen(false)}>Cancel</Button>
          <Button onClick={() => handleSettingChange()}>Save</Button>
        </DialogActions>{' '}
      </Dialog>
    </Box>
  );
}

export default JwtResultForm;
