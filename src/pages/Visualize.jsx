import React, { useState } from "react";
import { alpha } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Box } from "@mui/system";
import { Typography, Grid } from "@mui/material";
import ErrorNotifier from "../components/ToastNotifications/ErrorNotifier";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import FilterEditorWindow from "../components/FilterEditorWindow";
import VisualizeEditorWindow from "../components/VisualizeEditorWindow";

const query = `
{
  "vector_name": "image",
  "color_by": "payload_field",
  "limit": 3,
  "filter": {
    "must": [
      {
        "key": "city",
        "match": {
          "any": [
            "San Francisco",
            "New York",
            "Berlin"
          ]
        }
      }
    ]
  }
}

{
  "color_by": "payload_field",
  "limit": 10,
  "filter": {
      "should": [
          {
              "key": "city",
              "match": {
                  "value": "London"
              }
          }
      ]
  }
}
`;
const defaultResult = `{}`;

function Visualize() {
  const theme = useTheme();
  const [code, setCode] = useState(query);
  const [result, setResult] = useState(defaultResult);
  const [errorMessage, setErrorMessage] = useState(null);

  return (
    <>
      <Box
        component="main"
      >
        {errorMessage !== null && (
          <ErrorNotifier {...{ message: errorMessage }} />
        )}
        <Grid container  >
          {errorMessage && (
            <Grid xs={12} item textAlign={"center"}  >
              <Typography >⚠ Error: {errorMessage}</Typography>
            </Grid>
          )}
          <Grid xs={12} item >
            <PanelGroup direction="horizontal">
              <Panel>
                <VisualizeEditorWindow scrollResult={result} />
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
