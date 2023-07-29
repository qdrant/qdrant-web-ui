import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  alpha,
  Paper,
  Box,
  Tooltip,
  Typography,
  Grid,
  IconButton,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import ErrorNotifier from "../components/ToastNotifications/ErrorNotifier";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import FilterEditorWindow from "../components/FilterEditorWindow";
import VisualizeChart from "../components/VisualizeChart";

const query = `

// Specify request parameters to select data for visualization.
//
// Available parameters:
//
// - 'limit': maximum number of vectors to visualize.
//            *Warning*: large values may cause browser to freeze.
//
// - 'filter': filter expression to select vectors for visualization.
//             See https://qdrant.tech/documentation/concepts/filtering/
//
// - 'color_by': specify payload field to use for coloring points.
//
// - 'vector_name': specify which vector to use for visualization
//                  if there are multiple.
//
// Minimal example:

{
  "limit": 500
}


`;
const defaultResult = {};

function Visualize() {
  const theme = useTheme();
  const [code, setCode] = useState(query);
  const [result, setResult] = useState(defaultResult);
  const [errorMessage, setErrorMessage] = useState(null); // fixme: errorMessage is always null
  const navigate = useNavigate();
  const params = useParams();

  return (
    <>
      <Box component="main">
        {errorMessage !== null && (
          <ErrorNotifier {...{ message: errorMessage }} />
        )}
        <Grid container>
          {errorMessage && (
            <Grid xs={12} item textAlign={"center"}>
              <Typography>⚠ Error: {errorMessage}</Typography>
            </Grid>
          )}
          <Grid xs={12} item>
            <PanelGroup direction="horizontal">
              <Panel style={{ display: 'flex' }}>
                <Grid container direction={"column"} spacing={2}>
                  <Grid xs={1} item>
                    <Paper
                      sx={{ 
                        display: "flex", 
                        alignItems: "center", 
                        p: 1,
                        background: alpha(theme.palette.primary.main, 0.05),
                      }}
                      square
                      elevation={0}
                    >
                      <Tooltip title={"Back to collection"}>
                        <IconButton
                          sx={{ mr: 3 }}
                          size="small"
                          onClick={() => navigate(
                            `/collections/${params.collectionName}`)}>
                          <ArrowBack />
                        </IconButton>
                      </Tooltip>
                      <Typography
                        variant="h6">{params.collectionName}</Typography>
                    </Paper>
                  </Grid>
                  <Grid xs={11} item>
                    <VisualizeChart scrollResult={result} />
                  </Grid>
                </Grid>
              </Panel>
              <PanelResizeHandle
                style={{
                  width: "10px",
                  background: alpha(theme.palette.primary.main, 0.05),
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                  }}
                >
                  &#8942;
                </Box>
              </PanelResizeHandle>
              <Panel>
                <FilterEditorWindow
                  code={code}
                  onChange={setCode}
                  onChangeResult={setResult}
                />
              </Panel>
            </PanelGroup>
          </Grid>
        </Grid>
      </Box>
    </>
  );
}

export default Visualize;
