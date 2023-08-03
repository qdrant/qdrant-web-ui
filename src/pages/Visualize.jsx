import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { alpha, Paper, Box, Tooltip, Typography, Grid, IconButton } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
// import ErrorNotifier from '../components/ToastNotifications/ErrorNotifier';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import FilterEditorWindow from '../components/FilterEditorWindow';
import VisualizeChart from '../components/VisualizeChart';
import { useWindowResize } from '../hooks/windowHooks';

const query = `

// Specify request parameters to select data for visualization.
//
// Available parameters:
//
// - 'limit': maximum number of vectors to visualize.
//            *Warning*: large values may cause browser to freeze.
//
// - 'filter': filter expression to select vectors for visualization.
//             See https://qdrant.tech/documentation/concepts/filtering/
//
// - 'color_by': specify payload field to use for coloring points.
//
// - 'vector_name': specify which vector to use for visualization
//                  if there are multiple.
//
// Minimal example:

{
  "limit": 500
}


`;
const defaultResult = {};

function Visualize() {
  const theme = useTheme();
  const [code, setCode] = useState(query);
  const [result, setResult] = useState(defaultResult);
  // const [errorMessage, setErrorMessage] = useState(null); // todo: use or remove
  const navigate = useNavigate();
  const params = useParams();
  const [visualizeChartHeight, setVisualizeChartHeight] = useState(0);
  const VisualizeChartWrapper = useRef(null);
  const { height } = useWindowResize();

  useEffect(() => {
    setVisualizeChartHeight(height - VisualizeChartWrapper.current?.offsetTop);
  }, [height, VisualizeChartWrapper]);

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
              <Panel style={{ display: 'flex' }}>
                <Box width={'100%'}>
                  <Box>
                    <Paper sx={{ display: 'flex', alignItems: 'center', p: 1 }}>
                      <Tooltip title={'Back to collection'}>
                        <IconButton
                          sx={{ mr: 3 }}
                          size="small"
                          onClick={() => navigate(`/collections/${params.collectionName}`)}
                        >
                          <ArrowBack />
                        </IconButton>
                      </Tooltip>
                      <Typography variant="h6">{params.collectionName}</Typography>
                    </Paper>
                  </Box>
                  <Box ref={VisualizeChartWrapper} height={visualizeChartHeight} width={'100%'}>
                    <VisualizeChart scrollResult={result} />
                  </Box>
                </Box>
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
                <FilterEditorWindow code={code} onChange={setCode} onChangeResult={setResult} />
              </Panel>
            </PanelGroup>
          </Grid>
        </Grid>
      </Box>
    </>
  );
}

export default Visualize;
