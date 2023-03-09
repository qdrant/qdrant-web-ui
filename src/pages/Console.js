import React, { useEffect, useState } from "react";
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import CodeEditorWindow from "../components/CodeEditorWindow";
import { Button } from "@mui/material";
import RequestFromCode from "../components/RequesFromCode";


const query = `
PUT collections/abs
{
    "vectors": {
        "size": 1,
        "distance": "Cosine"
    }
}`;

const Item = styled(Paper)(({ theme }) => ({
  textAlign: 'center',
  backgroundColor: "gray",
  border: "solid  #32a1ce"
}));

function Console() {
  const [code, setCode] = useState(query);
  const [result, setResult] = useState("");
  const handleChange = async() => {
      const response=await RequestFromCode(code);
      setResult(JSON.stringify(response))
  }

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
    <Grid container spacing={1}>
      <Grid item xs={6}>
        <Item>
          <Button fullWidth onClick={handleChange}>
            Run Query
          </Button>
          <CodeEditorWindow
            code={code}
            onChange={onChangeCode}
            language={'javascript'}
            theme={"cobalt"}
          />
        </Item>
      </Grid>
      <Grid item xs={6}>
        <Item>
          <CodeEditorWindow
            code={result}
            onChange={onChangeResult}
            language={'javascript'}
            theme={"cobalt"}
            format={true}
          />
        </Item>
      </Grid>
    </Grid>
  );
}

export default Console;