import React from 'react';
import { SwipeableDrawer, Button, Box, Stack, Typography, ButtonGroup } from '@mui/material'

import Editor from "@monaco-editor/react";


export function History({ state, setState, code, handleEditorChange, toggleDrawer, currentSavedCodes, setCurrentSavedCodes }) {

    const [viewCode, setViewCode] = React.useState("//Selected Code");
  
    function deleteSavedCode(index) {
      currentSavedCodes.splice(index, 1);
      localStorage.setItem("currentSavedCodes", JSON.stringify(currentSavedCodes));
      setCurrentSavedCodes(JSON.parse(localStorage.getItem("currentSavedCodes")))
      return;
    }
  
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
                width: "50%",
                height: "50vh",
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
                spacing={3}
                m={2}
              >
                {currentSavedCodes.length > 0 &&
                  currentSavedCodes.map((currentSavedCode, i) => {
                    return (
                      <ButtonGroup key={i} variant="outlined" aria-label="outlined button group">
                        <Button
                          variant="outlined"
                          color="success"
                          onClick={
                            () => {
                              setViewCode(`${currentSavedCode.code.method} ${currentSavedCode.code.endpoint} \n${formatJSON(currentSavedCode.code.reqBody)} \n`)
                            }}
                        >
                          {currentSavedCode.name}  {currentSavedCode.time}
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={
                            () => {
                              deleteSavedCode(i)
                            }}
                        >
                          DELETE
                        </Button>
                      </ButtonGroup>
                    );
                  })
                }
              </Stack>
  
            </Box>
            <Box
              sx={{
                width: "50%",
                height: "100%",
              }}
              m={2}>
              <Editor
                height="34vh"
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
                      setState(false);
                      handleEditorChange("code", `${viewCode} \n${code}`)
                    }}>
                  Apply Code
                </Button>
                <Button
                  key={"close"}
                  variant="outlined"
                  color="error"
                  onClick={() => setState(false)}
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