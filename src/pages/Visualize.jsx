import React, { useState } from "react";
import { alpha } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Box } from "@mui/system";
import { Typography, Grid } from "@mui/material";
import ErrorNotifier from "../components/ToastNotifications/ErrorNotifier";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import FilterEditorWindow from "../components/FilterEditorWindow";
import ResultEditorWindow from "../components/ResultEditorWindow";

const query = `
{
  "vector_name": "Default",
  "color_by": "payload_field",
  "limit": 3,
  "with_vector":true,
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
  "vector_name": "Default",
  "color_by": "payload_field",
  "with_vector":true,
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
  const onChangeCode = (action, data) => {
    switch (action) {
      case "code": {
        setCode(data);
        break;
      }
      default: {
        console.warn("case not handled!", action, data);
      }
    }
  };
  const onChangeResult = (action, data) => {
    switch (action) {
      case "code": {
        setResult(data);
        break;
      }
      default: {
        console.warn("case not handled!", action, data);
      }
    }
  };

  return (
    <>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
        }}
      >
        {errorMessage !== null && (
          <ErrorNotifier {...{ message: errorMessage }} />
        )}
        <Grid container maxWidth={"xl"} >
          {errorMessage && (
            <Grid xs={12} item textAlign={"center"}  >
              <Typography >⚠ Error: {errorMessage}</Typography>
            </Grid>
          )}
          <Grid xs={12} item >
          <PanelGroup direction="horizontal">
              <Panel>
              <ResultEditorWindow code={result} />
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
                  onChange={onChangeCode}
                  onChangeResult={onChangeResult}
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
