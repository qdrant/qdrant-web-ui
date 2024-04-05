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
} from '@mui/material';
import { ArrowDropDown, Settings } from '@mui/icons-material';
import { TableBodyWithGaps, TableHeadWithGaps, TableWithGaps } from '../Common/TableWithGaps';
import DialogContentText from '@mui/material/DialogContentText';
import { useClient } from '../../context/client-context';
import { getErrorMessage } from '../../lib/get-error-message';
import { JsonViewer } from '@textea/json-viewer';

// todo: remove eslint-disable
const CollectionPoints = ({ selectedCollections }) => {
  const theme = useTheme();
  const { client: qdrantClient } = useClient();
  const [expandedPoint, setExpandedPoint] = React.useState(null);

  // todo: this copy-pasted from PointsTabs.jsx, need to be refactored to avoid duplication
  // perhaps, it should be moved to a separate hook
  const pageSize = 10;
  const [points, setPoints] = useState(null);
  const [offset, setOffset] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [conditions, setConditions] = useState([]);
  const [nextPageOffset, setNextPageOffset] = useState(null);
  const [usingVector, setUsingVector] = useState(null);
  const [payloadSchema, setPayloadSchema] = useState({});

  useEffect(() => {
    console.log('selectedCollections', selectedCollections);
    const getPoints = async (collectionName) => {
      if (conditions.length !== 0) {
        const recommendationIds = [];
        const filters = [];
        conditions.forEach((condition) => {
          if (condition.type === 'id') {
            recommendationIds.push(condition.value);
          } else if (condition.type === 'payload') {
            if (condition.value === null || condition.value === undefined) {
              filters.push({
                is_null: {
                  key: condition.key,
                },
              });
            } else if (condition.value === '') {
              filters.push({
                is_empty: {
                  key: condition.key,
                },
              });
            } else if (payloadSchema[condition.key] && payloadSchema[condition.key].data_type === 'text') {
              filters.push({ key: condition.key, match: { text: condition.value } });
            } else {
              filters.push({ key: condition.key, match: { value: condition.value } });
            }
          }
        });
        try {
          if (recommendationIds.length !== 0) {
            const newPoints = await qdrantClient.recommend(collectionName, {
              positive: recommendationIds,
              limit: pageSize + (offset || 0),
              with_payload: true,
              with_vector: true,
              using: usingVector,
              filter: {
                must: filters,
              },
            });
            setNextPageOffset(newPoints.length);
            setPoints({ points: newPoints });
            setErrorMessage(null);
          } else if (filters.length !== 0) {
            const newPoints = await qdrantClient.scroll(collectionName, {
              filter: {
                must: filters,
              },
              limit: pageSize + (offset || 0),
              with_payload: true,
              with_vector: true,
            });
            setPoints({
              points: [...(newPoints?.points || [])],
            });
            setNextPageOffset(newPoints?.next_page_offset);
            setErrorMessage(null);
          }
        } catch (error) {
          const message = getErrorMessage(error, { withApiKey: { apiKey: qdrantClient.getApiKey() } });
          message && setErrorMessage(message);
          setPoints({});
        }
      } else {
        try {
          const newPoints = await qdrantClient.scroll(collectionName, {
            offset,
            limit: pageSize,
            with_vector: true,
            with_payload: true,
          });
          setPoints({
            points: [...(points?.points || []), ...(newPoints?.points || [])],
          });
          setNextPageOffset(newPoints?.next_page_offset);
          setErrorMessage(null);
        } catch (error) {
          const message = getErrorMessage(error, { withApiKey: { apiKey: qdrantClient.getApiKey() } });
          message && setErrorMessage(message);
          setPoints({});
        }
      }
    };
    getPoints(selectedCollections);
  }, [selectedCollections]);

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
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                Id: {point.id}
                <IconButton onClick={() => handleTogglePoint(point.id)}>
                  <ArrowDropDown />
                </IconButton>
              </Box>
              {expandedPoint === point.id && (
                <Box>
                  <JsonViewer
                    theme={theme.palette.mode}
                    value={point.payload}
                    displayDataTypes={false}
                    defaultInspectDepth={0}
                    rootName={false}
                    enableClipboard={false}
                  />
                </Box>
              )}
            </TableCell>
          </TableRow>
        ))}
    </TableBodyWithGaps>
  );
};

CollectionPoints.propTypes = {
  selectedCollections: PropTypes.string.isRequired,
};

function JwtResultForm({ collections, selectedCollections, setSelectedCollections, settings, setSettings, sx }) {
  const theme = useTheme();
  const [settingsDialogOpen, setSettingsDialogOpen] = React.useState(false);
  const handleCollectionChange = (event) => {
    setSelectedCollections(event.target.value);
  };

  const handleSettingChange = (newSettings) => {
    setSettings(newSettings);
    setSettingsDialogOpen(false);
  };

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
                <FormControl sx={{ minWidth: 120, mt: -1, mb: -1 }}>
                  <Select
                    id="collection-select"
                    value={selectedCollections}
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
                    {collections.map((collection) => (
                      <MenuItem key={collection} value={collection}>
                        {collection}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <IconButton onClick={() => setSettingsDialogOpen(true)}>
                  <Settings />
                </IconButton>
              </Box>
            </TableCell>
          </TableRow>
        </TableHeadWithGaps>
        <CollectionPoints selectedCollections={selectedCollections} />
      </TableWithGaps>
      <Dialog fullWidth open={settingsDialogOpen} onClose={() => setSettingsDialogOpen(false)}>
        <DialogTitle>{'Settings'}</DialogTitle>
        <DialogContent>
          <DialogContentText>Change settings here</DialogContentText>
          <JsonViewer
            theme={theme.palette.mode}
            value={settings}
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
  collections: PropTypes.array.isRequired,
  selectedCollections: PropTypes.string.isRequired,
  setSelectedCollections: PropTypes.func.isRequired,
  settings: PropTypes.object.isRequired,
  setSettings: PropTypes.func.isRequired,
  sx: PropTypes.object,
};

export default JwtResultForm;
