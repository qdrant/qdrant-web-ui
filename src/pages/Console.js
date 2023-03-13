import React, { useEffect, useState } from "react";
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import CodeEditorWindow from "../components/CodeEditorWindow";
import ResultEditorWindow from "../components/ResultEditorWindow";

import { Button } from "@mui/material";
import { Box } from "@mui/system";


const query = `GET collections

PUT collections/demo1
{"vectors": {
        "size": 1,
        "distance": "Cosine"
    }
}

GET collections

DELETE collections/demo1

GET collections

GET collections/startups`;
const defaultResult = `
{"result": {"collections": [{"name": "collection1"},
      {
        "name": "startups"
      },
      {
        "name": "kzxzax"
      },
      {
        "name": "kzxzar"
      },
      {
        "name": "kar"
      },
      {
        "name": "absssssss"
      },
      {
        "name": "asssssbs"
      },
      {
        "name": "kasr"
      },
      {
        "name": "abs"
      },
      {
        "name": "collection2"
      },
      {
        "name": "assss"
      },
      {
        "name": "ab"
      },
      {
        "name": "abss"
      }
    ]
  },
  "status": "ok",
  "time": 0.000007124
}`
const Item = styled(Paper)(({ theme }) => ({
  textAlign: 'center',
  backgroundColor: "gray",
}));

function Console() {
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
    <Box   
    sx={{
      width: "100%",
      height: "100%",
      display:"flex",
    }}
>
      <Box 
          sx={{
            width: "50%",
            height: "100%"
          }}>
      <CodeEditorWindow
            code={code}
            onChange={onChangeCode}
            onChangeResult={onChangeResult}
          />
      </Box>
      <Box 
          sx={{
            width: "50%",
            height: "100%"
          }}>
      <ResultEditorWindow
            code={result}
          />
    </Box>
    </Box>

  );
}

export default Console;