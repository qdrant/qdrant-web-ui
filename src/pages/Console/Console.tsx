import { useState } from "react";
import { CodeEditorWindow, ResultEditorWindow, Menu } from "../../components";
import { Box } from "@mui/system";

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

export function Console() {
  const [code, setCode] = useState(query);
  const [result, setResult] = useState(defaultResult);

  const onChangeCode = (action: string, data: string) => {
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
  const onChangeResult = (action: string, data: string) => {
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
      <Menu code={code} handleEditorChange={onChangeCode} />
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
            height: "100%",
          }}
        >
          <CodeEditorWindow
            code={code}
            onChange={onChangeCode}
            onChangeResult={onChangeResult}
          />
        </Box>
        <Box
          sx={{
            width: "50%",
            height: "100%",
          }}
        >
          <ResultEditorWindow code={result} />
        </Box>
      </Box>
    </>
  );
}
