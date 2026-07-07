import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Box, Button, Stack, Typography } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import DataObjectIcon from '@mui/icons-material/DataObject';
import { DataGrid } from '@mui/x-data-grid';
import { useSnackbar } from 'notistack';
import { bigIntJSON } from '../../common/bigIntJSON';

// How many payload fields get their own table column
const MAX_PAYLOAD_COLUMNS = 8;

function formatCell(value) {
  if (value === undefined) {
    return '';
  }
  if (value !== null && typeof value === 'object') {
    return bigIntJSON.stringify(value);
  }
  return String(value);
}

// Table view of the points selected in the chart, with copy actions
// for external analysis
const SelectionPanel = ({ points, onPointClick }) => {
  const { enqueueSnackbar } = useSnackbar();

  const payloadKeys = useMemo(() => {
    const keys = [];
    for (const point of points.slice(0, 100)) {
      for (const key of Object.keys(point.payload ?? {})) {
        if (!keys.includes(key)) {
          keys.push(key);
        }
      }
      if (keys.length >= MAX_PAYLOAD_COLUMNS) {
        break;
      }
    }
    return keys.slice(0, MAX_PAYLOAD_COLUMNS);
  }, [points]);

  const columns = useMemo(
    () => [
      { field: 'id', headerName: 'id', width: 110 },
      ...payloadKeys.map((key) => ({
        field: `payload.${key}`,
        headerName: key,
        flex: 1,
        minWidth: 130,
        sortable: false,
        renderCell: (params) => formatCell(params.row.point.payload?.[key]),
      })),
    ],
    [payloadKeys]
  );

  const rows = useMemo(() => points.map((point) => ({ id: String(point.id), point })), [points]);

  const copyToClipboard = async (label, text) => {
    try {
      await navigator.clipboard.writeText(text);
      enqueueSnackbar(`${label} copied to clipboard`, { variant: 'success' });
    } catch (e) {
      enqueueSnackbar(`Copy failed: ${e.message}`, { variant: 'error' });
    }
  };

  const copyIds = () => copyToClipboard('Point ids', bigIntJSON.stringify(points.map((point) => point.id)));

  const copyJson = () =>
    copyToClipboard(
      'Points',
      bigIntJSON.stringify(
        points.map(({ id, payload, score }) => ({ id, payload, ...(score !== undefined && { score }) })),
        null,
        2
      )
    );

  const copyFilter = () =>
    copyToClipboard('Filter', bigIntJSON.stringify({ must: [{ has_id: points.map((point) => point.id) }] }, null, 2));

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ p: 1 }}>
        <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
          {points.length} selected points
        </Typography>
        <Button size="small" startIcon={<ContentCopyIcon />} onClick={copyIds}>
          Copy ids
        </Button>
        <Button size="small" startIcon={<DataObjectIcon />} onClick={copyJson}>
          Copy JSON
        </Button>
        <Button
          size="small"
          startIcon={<FilterAltIcon />}
          onClick={copyFilter}
          title="Qdrant filter matching the selection"
        >
          Copy filter
        </Button>
      </Stack>
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          density="compact"
          disableRowSelectionOnClick
          onRowClick={(params) => onPointClick?.(params.row.point)}
          initialState={{ pagination: { paginationModel: { pageSize: 100 } } }}
          pageSizeOptions={[100]}
          sx={{ border: 0, '& .MuiDataGrid-row': { cursor: 'pointer' } }}
        />
      </Box>
    </Box>
  );
};

SelectionPanel.propTypes = {
  points: PropTypes.array.isRequired,
  onPointClick: PropTypes.func,
};

export default SelectionPanel;
