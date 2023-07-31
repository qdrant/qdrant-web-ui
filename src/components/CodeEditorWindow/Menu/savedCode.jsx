import React, { memo, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { SwipeableDrawer, Button, Box, Stack, TextField, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import EditorCommon from '../../EditorCommon';

function SavedCode({ state, code, handleEditorChange, toggleDrawer }) {
  const [viewCode, setViewCode] = React.useState(`//Current Editor Code: \n${code}`);
  const [saveNameText, setSaveNameText] = useState('');
  const [savedCodes, setSavedCodes] = useState(
    localStorage.getItem('savedCodes') ? JSON.parse(localStorage.getItem('savedCodes')) : []
  );

  useEffect(() => {
    setSavedCodes(localStorage.getItem('savedCodes') ? JSON.parse(localStorage.getItem('savedCodes')) : []);
    setViewCode(`//Current Editor Code: \n${code}`);
  }, [state]);

  function saveCode() {
    if (saveNameText !== '') {
      const data = [
        ...savedCodes,
        {
          idx: saveNameText + Date.now(), // unique id to prevent duplicate
          name: saveNameText,
          code: code,
          time: new Date().toLocaleTimeString(),
          date: new Date().toLocaleDateString(),
        },
      ];
      localStorage.setItem('savedCodes', JSON.stringify(data));
      setSavedCodes(JSON.parse(localStorage.getItem('savedCodes')));
      setSaveNameText('');
    }
  }

  const columns = [
    {
      field: 'name',
      headerName: 'Name',
      minWidth: 100,
      valueGetter: (params) => params.row.name,
      flex: 1,
    },
    {
      field: 'time',
      headerName: 'Time',
      width: 100,
      valueGetter: (params) => params.row.time,
    },
    {
      field: 'date',
      headerName: 'Date',
      width: 100,
      valueGetter: (params) => params.row.date,
    },
    {
      field: 'delete',
      headerName: 'Delete',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => deleteIcon(params.row),
    },
  ];
  function deleteIcon(data) {
    return (
      <Button
        color="error"
        onClick={() => {
          const index = savedCodes.indexOf(data);
          const updateCode = [...savedCodes];
          updateCode.splice(index, 1);
          localStorage.setItem('savedCodes', JSON.stringify(updateCode));
          setSavedCodes(JSON.parse(localStorage.getItem('savedCodes')));
        }}
      >
        <DeleteIcon />
      </Button>
    );
  }
  return (
    <React.Fragment key={'SavedCode'}>
      <SwipeableDrawer anchor="top" open={state} onClose={toggleDrawer} onOpen={toggleDrawer}>
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            mt: 8,
          }}
        >
          <Box
            sx={{
              width: '60%',
            }}
          >
            <Typography variant="h5" m={2} gutterBottom>
              Saved Code
            </Typography>
            <Stack direction="row" spacing={2} m={2}>
              <TextField
                placeholder=" Name (Required)*"
                variant="standard"
                value={saveNameText}
                onChange={(e) => {
                  setSaveNameText(e.target.value);
                }}
              />
              <Button onClick={saveCode}>Save</Button>
            </Stack>
            {savedCodes.length === 0 && (
              <Stack direction="row" spacing={2}>
                <Typography variant="h6" m={2} gutterBottom>
                  No save code found
                </Typography>
              </Stack>
            )}
            <Stack direction="column" justifyContent="center" alignItems="stretch" spacing={2} m={2}>
              {savedCodes.length > 0 && (
                <div style={{ height: '375px', width: '100%' }}>
                  <DataGrid
                    sx={{
                      '&.MuiDataGrid-root .MuiDataGrid-cell:focus-within': {
                        outline: 'none !important',
                      },
                      '& .MuiDataGrid-columnHeader:focus-within, & .MuiDataGrid-columnHeader:focus': {
                        outline: 'none !important',
                      },
                    }}
                    rows={savedCodes}
                    columns={columns}
                    initialState={{
                      pagination: {
                        paginationModel: {
                          pageSize: 5,
                        },
                      },
                    }}
                    pageSizeOptions={[5, 10, 15]}
                    rowsPerPageOptions={[5, 10]}
                    getRowId={(row) => `${row.time} ${row.date}`}
                    onRowClick={(params) => {
                      setViewCode(params.row.code);
                    }}
                  />
                </div>
              )}
            </Stack>
          </Box>
          <Box
            sx={{
              width: '40%',
            }}
            m={2}
          >
            <EditorCommon
              height="475px"
              value={viewCode}
              options={{
                scrollBeyondLastLine: false,
                fontSize: 12,
                wordWrap: 'on',
                minimap: { enabled: false },
                automaticLayout: true,
                readOnly: true,
                mouseWheelZoom: true,
              }}
            />

            <Stack direction="row" spacing={2} mt={2}>
              <Button
                key={'apply'}
                variant="outlined"
                color="success"
                onClick={() => {
                  handleEditorChange('code', `${viewCode} \n${code}`);
                  toggleDrawer();
                }}
              >
                Apply Code
              </Button>
              <Button key={'close'} variant="outlined" color="error" onClick={toggleDrawer}>
                Close
              </Button>
            </Stack>
          </Box>
        </Box>
      </SwipeableDrawer>
    </React.Fragment>
  );
}

SavedCode.propTypes = {
  state: PropTypes.bool.isRequired,
  toggleDrawer: PropTypes.func,
  handleEditorChange: PropTypes.func.isRequired,
  code: PropTypes.string.isRequired,
};

export default memo(SavedCode);
