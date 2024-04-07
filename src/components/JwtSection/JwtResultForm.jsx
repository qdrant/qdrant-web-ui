/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
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
  IconButton,
  Typography,
} from '@mui/material';
import { ArrowDropDown, Settings } from '@mui/icons-material';
import { TableBodyWithGaps, TableHeadWithGaps, TableWithGaps } from '../Common/TableWithGaps';
import DialogContentText from '@mui/material/DialogContentText';
import { JsonViewer } from '@textea/json-viewer';

import qdrantClient from '../../common/client';

function renderErrorMessage(error) {
  const data = error.data;

  // If data is a string, return it as is
  if (typeof data === 'string') {
    return data;
  }
  // If data is an object, try to extract the message
  if (typeof data === 'object') {
    if (data?.status?.error) {
      return data.status.error;
    }
    return JSON.stringify(data);
  }
}

// todo: remove eslint-disable
const CollectionPoints = ({ selectedCollection, jwt }) => {
  const theme = useTheme();
  const [expandedPoint, setExpandedPoint] = React.useState(null);

  // todo: this copy-pasted from PointsTabs.jsx, need to be refactored to avoid duplication
  // perhaps, it should be moved to a separate hook
  const pageSize = 10;
  const [points, setPoints] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const client = qdrantClient({apiKey: jwt});

  useEffect(() => {
    const getPoints = async (collectionName) => {
      if (!collectionName) {
        setPoints({});
        return;
      }
      try {
        const newPoints = await client.scroll(collectionName, {
          limit: pageSize,
          with_vector: false,
          with_payload: true,
        });
        setPoints({
          points: newPoints?.points || [],
        });
        setErrorMessage(null);
      } catch (error) {
        const message = "Status: " + error.status + ", message: " + renderErrorMessage(error);
        message && setErrorMessage(message);
        setPoints({});
      }
    };
    getPoints(selectedCollection);
  }, [selectedCollection, jwt]);

  // end of copy-paste

  const handleTogglePoint = (id) => {
    if (expandedPoint === id) {
      setExpandedPoint(null);
    } else {
      setExpandedPoint(id);
    }
  };

  return (
    <TableBodyWithGaps>
      {points?.points &&
        points.points.map((point) => (
          <TableRow
            key={point.id}
            sx={theme.palette.mode === 'light' ? { background: theme.palette.background.paper } : {}}
          >
            <TableCell>
              <Box>
                <JsonViewer
                  theme={theme.palette.mode}
                  value={{
                    id: point.id,
                    payload: point.payload,
                  }}
                  displayDataTypes={false}
                  defaultInspectDepth={1}
                  rootName={false}
                  enableClipboard={false}
                />
              </Box>
            </TableCell>
          </TableRow>
        ))}
      {errorMessage && (
        <TableRow>
          <TableCell colSpan={2}>
            <Typography color="error">{errorMessage}</Typography>
          </TableCell>
        </TableRow>
      )}
    </TableBodyWithGaps>
  );
};

CollectionPoints.propTypes = {
  selectedCollection: PropTypes.string.isRequired,
  jwt: PropTypes.string.isRequired,
};

function JwtResultForm({ allCollecitons, configuredCollections, setConfiguredCollections, jwt, sx }) {
  const theme = useTheme();
  const [settingsDialogOpen, setSettingsDialogOpen] = React.useState(false);
  const [selectedCollection, setSelectedCollection] = React.useState('');

  const handleCollectionChange = (event) => {
    setSelectedCollection(event.target.value);
  };

  const handleSettingChange = (newSettings) => {
    setSettingsDialogOpen(false);
  };

  useEffect(() => {
    if (allCollecitons.length > 0 && selectedCollection === '') {
      setSelectedCollection(allCollecitons[0]);
    }
  }, [allCollecitons]);

  return (
    <Box
      sx={{
        background: theme.palette.mode === 'dark' ? theme.palette.background.code : theme.palette.background.code,
        p: 2,
        px: 5,
        ...sx,
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
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                }}>
                  <Typography>Preview:</Typography>
                  <FormControl sx={{ minWidth: 120, mt: -1, mb: -1 }}>
                    <Select
                      id="collection-select"
                      value={selectedCollection}
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
                        <em>Not Selected</em>
                      </MenuItem>
                      {allCollecitons.map((collection) => (
                        <MenuItem key={collection} value={collection}>
                          {collection}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                <IconButton onClick={() => setSettingsDialogOpen(true)}>
                  <Settings />
                </IconButton>
              </Box>
            </TableCell>
          </TableRow>
        </TableHeadWithGaps>
        <CollectionPoints 
          selectedCollection={selectedCollection}
          jwt={jwt}
        />
      </TableWithGaps>
      <Dialog fullWidth open={settingsDialogOpen} onClose={() => setSettingsDialogOpen(false)}>
        <DialogTitle>Access Settings</DialogTitle>
        <DialogContent>
          <DialogContentText>Change settings here</DialogContentText>
          <JsonViewer
            theme={theme.palette.mode}
            value={{}}
            displayDataTypes={false}
            defaultInspectDepth={0}
            rootName={false}
            enableClipboard={false}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsDialogOpen(false)}>Cancel</Button>
          <Button onClick={() => handleSettingChange()}>Save</Button>
        </DialogActions>{' '}
      </Dialog>
    </Box>
  );
}

JwtResultForm.propTypes = {
  allCollecitons: PropTypes.array.isRequired,
  configuredCollections: PropTypes.array.isRequired,
  setConfiguredCollections: PropTypes.func.isRequired,
  jwt: PropTypes.string.isRequired,
  sx: PropTypes.object,
};

export default JwtResultForm;
