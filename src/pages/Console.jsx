import React, { useState } from 'react';
import { alpha } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import { Grid } from '@mui/material';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import CodeEditorWindow from '../components/CodeEditorWindow';
import ResultEditorWindow from '../components/ResultEditorWindow';
import SpeedDialMenu from '../components/CodeEditorWindow/Menu/SpeedDialMenu';
import History from '../components/CodeEditorWindow/Menu/history';
import SavedCode from '../components/CodeEditorWindow/Menu/savedCode';

const query = `// List all collections
GET collections

// Get collection info
GET collections/collection_name

// List points in a collection, using filter
POST collections/collection_name/points/scroll
{
  "limit": 10,
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
`;

const defaultResult = `{}`;

function Console() {
  const theme = useTheme();
  const [code, setCode] = useState(localStorage.getItem('qwuiConsoleCode') ?? query);
  const [result, setResult] = useState(defaultResult);
  // const [errorMessage, setErrorMessage] = useState(null); // todo: use or remove

  const [openHistory, setOpenHistory] = useState(false);
  const [openSavedCode, setOpenSavedCode] = useState(false);

  const onChangeCode = (action, data) => {
    switch (action) {
      case 'code': {
        localStorage.setItem('qwuiConsoleCode', data);
        setCode(data);
        break;
      }
      default: {
        console.warn('case not handled!', action, data);
      }
    }
  };
  const onChangeResult = (action, data) => {
    switch (action) {
      case 'code': {
        setResult(data);
        break;
      }
      default: {
        console.warn('case not handled!', action, data);
      }
    }
  };

  return (
    <>
      <Box component="main">
        {/* {errorMessage !== null && <ErrorNotifier {...{message: errorMessage}} />} */}
        <Grid container>
          {/*  {errorMessage && (*/}
          {/*    <Grid xs={12} item textAlign={'center'}>*/}
          {/*      <Typography>⚠ Error: {errorMessage}</Typography>*/}
          {/*    </Grid>*/}
          {/*  )}*/}
          <Grid xs={12} item>
            <PanelGroup direction="horizontal">
              <Panel>
                <CodeEditorWindow code={code} onChange={onChangeCode} onChangeResult={onChangeResult} />
              </Panel>
              <PanelResizeHandle
                style={{
                  width: '10px',
                  background: alpha(theme.palette.primary.main, 0.05),
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                  }}
                >
                  &#8942;
                </Box>
              </PanelResizeHandle>
              <Panel>
                <ResultEditorWindow code={result} />
              </Panel>
            </PanelGroup>
          </Grid>
          <SpeedDialMenu
            openHistory={() => setOpenHistory(true)}
            openSavedCode={() => setOpenSavedCode(true)}
            resetConsole={() => onChangeCode('code', query)}
          />
          <History
            code={code}
            handleEditorChange={onChangeCode}
            state={openHistory}
            toggleDrawer={() => setOpenHistory(!openHistory)}
          />
          <SavedCode
            code={code}
            handleEditorChange={onChangeCode}
            state={openSavedCode}
            toggleDrawer={() => setOpenSavedCode(!openSavedCode)}
          />
        </Grid>
      </Box>
    </>
  );
}

export default Console;
