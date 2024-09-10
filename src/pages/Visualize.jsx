import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { alpha, Paper, Box, Tooltip, Typography, Grid, IconButton } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import FilterEditorWindow from '../components/FilterEditorWindow';
import VisualizeChart from '../components/VisualizeChart';
import { useWindowResize } from '../hooks/windowHooks';
import { requestFromCode } from '../components/FilterEditorWindow/config/RequestFromCode';
// import PointsPreview from '../components/VisualizeChart/PointsPreview';
import PointPreview from "../components/Common/PointPreview";

const query = `

// Try me!

{
  "limit": 500
}

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
// - 'color_by': specify score or payload field to use for coloring points.
//               How to use:
//
//                "color_by": "field_name"
//
//                or
//
//                "color_by": {
//                  "payload": "field_name"
//                }
//
//                or
//
//                "color_by": {
//                  "discover_score": {
//                    "target": 42,
//                    "context": [{"positive": 1, "negative": 0}]
//                  }
//                }
//
// - 'vector_name': specify which vector to use for visualization
//                  if there are multiple.
//
// - 'algorithm': specify algorithm to use for visualization. Available options: 'TSNE', 'UMAP'.


`;
const defaultResult = {};

function Visualize() {
  const theme = useTheme();
  const [code, setCode] = useState(query);
  const [result, setResult] = useState(defaultResult);
  const [algorithm, setAlgorithm] = useState('TSNE');
  // const [errorMessage, setErrorMessage] = useState(null); // todo: use or remove
  const navigate = useNavigate();
  const params = useParams();
  const [visualizeChartHeight, setVisualizeChartHeight] = useState(0);
  const VisualizeChartWrapper = useRef(null);
  const { height } = useWindowResize();
  const [activePoint, setActivePoint] = useState(null);

  useEffect(() => {
    setVisualizeChartHeight(height - VisualizeChartWrapper.current?.offsetTop);
  }, [height, VisualizeChartWrapper]);

  const onEditorCodeRun = async (data, collectionName) => {
    if (data?.algorithm) {
      setAlgorithm(data.algorithm);
    }

    const result = await requestFromCode(data, collectionName);
    setResult(result);
  };

  const filterRequestSchema = (vectorNames) => ({
    description: 'Filter request',
    type: 'object',
    properties: {
      limit: {
        description: 'Page size. Default: 10',
        type: 'integer',
        format: 'uint',
        minimum: 1,
        nullable: true,
      },
      filter: {
        description: 'Look only for points which satisfies this conditions. If not provided - all points.',
        anyOf: [
          {
            $ref: '#/components/schemas/Filter',
          },
          {
            nullable: true,
          },
        ],
      },
      vector_name: {
        description: 'Vector field name',
        type: 'string',
        enum: vectorNames,
      },
      color_by: {
        description: 'Color points by this field',
        type: 'string',
        nullable: true,
      },
      algorithm: {
        description: 'Algorithm to use for visualization',
        type: 'string',
        enum: ['TSNE', 'UMAP'],
        default: 'TSNE',
      },
    },
  });

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
                    <Paper
                      variant="heading"
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        p: 1,
                        borderRadius: 0,
                      }}
                    >
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
                    <VisualizeChart
                      scrollResult={result}
                      algorithm={algorithm}
                      activePoint={activePoint}
                      setActivePoint={setActivePoint} />
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
                <PanelGroup direction="vertical">
                  <Panel defaultSize={40}>
                    <FilterEditorWindow
                      code={code}
                      onChange={setCode}
                      onChangeResult={onEditorCodeRun}
                      customRequestSchema={filterRequestSchema}
                    />
                  </Panel>
                  <PanelResizeHandle
                    style={{
                      height: '10px',
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
                      &#8943;
                    </Box>
                  </PanelResizeHandle>
                  <Panel
                    defaultSize={60}
                    style={{
                      overflowY: 'scroll',
                    }}
                  >
                    {activePoint && <PointPreview point={activePoint} />}
                  </Panel>
                </PanelGroup>
              </Panel>
            </PanelGroup>
          </Grid>
        </Grid>
      </Box>
    </>
  );
}

export default Visualize;
