import React, { useState } from "react";
import { alpha } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Box } from "@mui/system";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import FilterEditorWindow from "../components/FilterEditorWindow";

const defaultResult = `{}`;


function Visualize() {
  const theme = useTheme();
  const [result, setResult] = useState(defaultResult);
  return (
    <>
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
    </>
  );
}

export default Visualize;
