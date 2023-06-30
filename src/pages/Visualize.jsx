import React, { useState } from "react";
import { alpha, Grid } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Box  } from "@mui/system";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import FilterEditorWindow from "../components/FilterEditorWindow";

const defaultResult = `{}`;


function Visualize() {
  const theme = useTheme();
  const [result, setResult] = useState(defaultResult);
  return (
        <>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
        }}
      >
        {/* {errorMessage !== null && (
          <ErrorNotifier {...{ message: errorMessage }} />
        )} */}
        <Grid container maxWidth={"xl"} >
          {/* {errorMessage && (
            <Grid xs={12} item textAlign={"center"}  >
              <Typography >⚠ Error: {errorMessage}</Typography>
            </Grid>
          )} */}
          <Grid xs={12} item >
          <PanelGroup direction="horizontal">
              <Panel>
              <p>
            {JSON.stringify(result, null, 2)}
          </p>  
              </Panel>
              <PanelResizeHandle style={{
                width: "10px",
                background: alpha(theme.palette.primary.main, 0.05),
              }}>
                <Box sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                }}>
                  &#8942;
                </Box>
              </PanelResizeHandle>
              <Panel>
              <FilterEditorWindow setResult={setResult}/>
              </Panel>
            </PanelGroup>
          </Grid>
        </Grid>
      </Box>
    </>
  );
}

export default Visualize;