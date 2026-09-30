import React, { useEffect, useRef, useState } from 'react';
import { LinearProgress, alpha, Fab, Tooltip, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import { Grid } from '@mui/material';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import CodeEditorWindow from '../components/CodeEditorWindow';
import ResultEditorWindow from '../components/ResultEditorWindow';
import { Code } from '@mui/icons-material';
import CommandsDrawer from '../components/CodeEditorWindow/Menu/CommandsDrawer/CommandsDrawer';
import { green } from '@mui/material/colors';
import { useWindowResize } from '../hooks/windowHooks';

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

// Lets the editor inside a panel fill the panel's height.
const panelContentSx = { height: '100%', '& > div': { height: '100%' } };

function Console() {
  const theme = useTheme();
  const [code, setCode] = useState(localStorage.getItem('qwuiConsoleCode') ?? query);
  const [result, setResult] = useState(defaultResult);

  const [requestCount, setRequestCount] = React.useState(0);
  const [openCommands, setOpenCommands] = useState(false);

  // Below md side-by-side editors get too narrow, so the panels are stacked vertically instead.
  const isVertical = useMediaQuery(theme.breakpoints.down('md'));
  const panelsRef = useRef(null);
  const { height: windowHeight } = useWindowResize();
  const [panelsHeight, setPanelsHeight] = useState(0);

  // In vertical layout both editors share the remaining window height,
  // so the panel group gets an explicit height and the editors fill their panels.
  useEffect(() => {
    setPanelsHeight(windowHeight - (panelsRef.current?.offsetTop ?? 0));
  }, [windowHeight, isVertical]);

  const editorHeight = isVertical ? '100%' : undefined;

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
        <Grid container>
          <Grid size={12}>
            <Box sx={{ width: '100%', height: '4px' }}>
              <LinearProgress sx={requestCount ? {} : { display: 'none' }} />
            </Box>
            <Box ref={panelsRef}>
              <PanelGroup
                direction={isVertical ? 'vertical' : 'horizontal'}
                style={isVertical ? { height: panelsHeight } : undefined}
              >
                <Panel>
                  <Box sx={panelContentSx}>
                    <CodeEditorWindow
                      code={code}
                      onChange={onChangeCode}
                      onChangeResult={onChangeResult}
                      setRequestCount={setRequestCount}
                      customHeight={editorHeight}
                    />
                  </Box>
                </Panel>
                <PanelResizeHandle
                  style={{
                    ...(isVertical ? { height: '10px' } : { width: '10px' }),
                    background: alpha(theme.palette.primary.main, 0.05),
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                      lineHeight: 1,
                    }}
                  >
                    {isVertical ? <>&#8943;</> : <>&#8942;</>}
                  </Box>
                </PanelResizeHandle>
                <Panel>
                  <Box sx={panelContentSx}>
                    <ResultEditorWindow code={result} customHeight={editorHeight} />
                  </Box>
                </Panel>
              </PanelGroup>
            </Box>
          </Grid>
          <Tooltip title="Commands" placement="left" arrow>
            <Fab
              sx={{
                position: 'absolute',
                bottom: '40px',
                right: '49px',
                boxShadow: 3,
                backgroundColor: green[500],
                '&:hover': { backgroundColor: green[700] },
              }}
              color="info"
              aria-label="add"
              onClick={() => setOpenCommands(true)}
            >
              <Code />
            </Fab>
          </Tooltip>
          <CommandsDrawer
            open={openCommands}
            toggleDrawer={() => {
              setOpenCommands(!openCommands);
            }}
            handleInsertCommand={(command) => {
              const nextCode = `${command}\n\n${code}`;

              onChangeCode('code', nextCode);
            }}
          />
        </Grid>
      </Box>
    </>
  );
}

export default Console;
