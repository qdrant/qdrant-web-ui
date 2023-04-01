import React, { useEffect, useState } from 'react';
import { SwipeableDrawer, Button, Box, Stack, Typography } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import Editor from "@monaco-editor/react";


export function History({ state, code, handleEditorChange, toggleDrawer }) {

  const [viewCode, setViewCode] = React.useState("//Selected Code");
  const [currentSavedCodes, setCurrentSavedCodes] = useState(localStorage.getItem("currentSavedCodes") ? JSON.parse(localStorage.getItem("currentSavedCodes")) : []);


  useEffect(() => {
    setCurrentSavedCodes(localStorage.getItem("currentSavedCodes") ? JSON.parse(localStorage.getItem("currentSavedCodes")) : []);
  }, [state])

  function formatJSON(val = {}) {
    if (val && Object.keys(val).length !== 0) {
      try {
        return JSON.stringify(val, null, 2)
      } catch {
        const errorJson = {
          "error": `HERE ${val}`
        }
        return JSON.stringify(errorJson, null, 2)
      }
    }
    else {
      return ""
    }
  }

  const columns = [

    {
      field: "method",
      headerName: 'Method',
      width: 100,
      valueGetter: (params) => params.row.code.method,
    },
    {
      field: "endpoint",
      headerName: 'Endpoint',
      width: 250,
      valueGetter: (params) => params.row.code.endpoint,
    },
    {
      field: "time",
      headerName: 'Time',
      width: 90,
      valueGetter: (params) => params.row.time,
    },
    {
      field: "date",
      headerName: 'Date',
      width: 100,
      valueGetter: (params) => params.row.date,
    },
    {
      field: "view",
      headerName: "View",
      width: 100,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => veiwIcon(params.row.code)
    },
    {
      field: "delete",
      headerName: "Delete",
      width: 100,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => deleteIcon(params.row)
    },


  ];

  function veiwIcon(code) {
    return (
      <Button
        color="success"
        onClick={
          () => {
            setViewCode(`${code.method} ${code.endpoint} \n${formatJSON(code.reqBody)} \n`)
          }}
      >
        <RemoveRedEyeIcon />
      </Button>
    );
  }
  function deleteIcon(data) {
    return (
      <Button
        color="error"
        onClick={
          () => {
            const index=currentSavedCodes.indexOf(data)
            const updateCode =[...currentSavedCodes]
            updateCode.splice(index, 1);
            console.log(updateCode)
            localStorage.setItem("currentSavedCodes", JSON.stringify(updateCode));
            setCurrentSavedCodes(JSON.parse(localStorage.getItem("currentSavedCodes")))
            return;
          }}
      >
        <DeleteIcon />
      </Button>
    );
  }
  return (
    <React.Fragment key={"History"}>
      <SwipeableDrawer
        anchor="top"
        open={state}
        onClose={toggleDrawer(false)}
        onOpen={toggleDrawer(true)}
      >
        <Box
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
          }}
        >
          <Box
            sx={{
              width: "60%",
              height: "80vh",
              overflow: "hidden",
              overflowY: "scroll",
            }}>
            <Stack direction="row" spacing={2}>
              <Typography variant="h5" m={2} gutterBottom>
                History Mode
              </Typography>
            </Stack>
            {currentSavedCodes.length === 0 &&
              (
                <Stack direction="row" spacing={2} >
                  <Typography variant="h6" m={2} gutterBottom>
                    No history available
                  </Typography>
                </Stack>
              )
            }
            <Stack
              direction="column"
              justifyContent="center"
              alignItems="stretch"
              spacing={2}
              m={2}
            >
              {currentSavedCodes.length > 0 &&
                <div style={{ height: 400, width: '100%' }}>
                  <DataGrid
                    rows={currentSavedCodes}
                    columns={columns}
                    initialState={{
                      pagination: {
                        paginationModel: {
                          pageSize: 5,
                        },
                      },
                    }}
                    pageSizeOptions={[5,10,15]}
                    rowsPerPageOptions={[5, 10]}
                    getRowId={(row) => `${row.time} ${row.date}`}
                  />
                </div>
              }
            </Stack>

          </Box>
          <Box
            sx={{
              width: "40%",
              height: "100%",
            }}
            m={2}>
            <Editor
              height="64vh"
              value={(viewCode)}
              options={{
                scrollBeyondLastLine: false,
                fontSize: 12,
                wordWrap: "on",
                minimap: { enabled: false },
                automaticLayout: true,
                readOnly: true,
                mouseWheelZoom: true,
              }}
            />

            <Stack direction="row" spacing={2}>
              <Button
                key={"apply"}
                variant="outlined"
                color="success"
                onClick={
                  () => {
                    handleEditorChange("code", `${viewCode} \n${code}`)
                    toggleDrawer(false)();
                  }}>
                Apply Code
              </Button>
              <Button
                key={"close"}
                variant="outlined"
                color="error"
                onClick={toggleDrawer(false)}
              >
                Close
              </Button>
            </Stack>
          </Box>
        </Box>
      </SwipeableDrawer>

    </React.Fragment>
  );
}