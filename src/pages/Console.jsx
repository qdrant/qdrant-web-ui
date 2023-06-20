import React, { useState } from "react";
import { alpha } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Box } from "@mui/system";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import Menu from "../components/CodeEditorWindow/Menu";
import CodeEditorWindow from "../components/CodeEditorWindow";
import ResultEditorWindow from "../components/ResultEditorWindow";

const query = `GET collections

// Create a collection
PUT collections/demo1
{
    "vectors": 
    {
        "size": 1, // Small vectors
        "distance": "Cosine"
    }
}

GET collections

DELETE collections/demo1

GET collections

GET collections/startups`;
const defaultResult = `{"result": {"collections": [{"name": "collection1"},
      {
        "name": "startups"
      }
    ]
  },
  "status": "ok",
  "time": 0.000007124
}`;

function Console() {
  const theme = useTheme();
  const [code, setCode] = useState(query);
  const [result, setResult] = useState(defaultResult);

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
      <Menu code={code} handleEditorChange={onChangeCode}/>

      <PanelGroup direction="horizontal">
        <Panel>
          <CodeEditorWindow
            code={code}
            onChange={onChangeCode}
            onChangeResult={onChangeResult}
          />
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
          <ResultEditorWindow code={result}/>
        </Panel>
      </PanelGroup>
    </>
  );
}

export default Console;
