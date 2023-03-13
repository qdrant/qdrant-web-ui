import React, { useEffect, useState } from "react";
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import CodeEditorWindow from "../components/CodeEditorWindow";
import { Button } from "@mui/material";
import { Box } from "@mui/system";


const query = `
PUT collections/abs
{
    "vectors": {
        "size": 1,
        "distance": "Cosine"
    }
}

PUT collections/abs
{
    "vectors": {
        "size": 1,
        "distance": "Cosine"
    }}








    
PUT collections/abs
{"vectors": {
        "size": 1,
        "distance": "Cosine"
    }
}

PUT collections/abs

PUT collections/abs
{"vectors": {
        "size": 1,
        "distance": "Cosine"
    }
}

PUT collections/abs
`;

const Item = styled(Paper)(({ theme }) => ({
  textAlign: 'center',
  backgroundColor: "gray",
}));

function Console() {
  const [code, setCode] = useState(query);
  const [result, setResult] = useState("");

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
            setResult={setResult}
          />
      </Box>
      <Box 
          sx={{
            width: "50%",
            height: "100%"
          }}>
      <CodeEditorWindow
            code={result}
            onChange={onChangeResult}
            language={'javascript'}
            theme={"cobalt"}
            format={true}
          />
    </Box>
    </Box>

  );
}

export default Console;