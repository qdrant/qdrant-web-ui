import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate, useParams } from 'react-router-dom';
import {
  alpha,
  Paper,
  Box,
  Tooltip,
  Typography,
  Grid,
  IconButton,
} from "@mui/material";
import { ArrowBack } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import GraphVisualisation
  from "../components/GraphVisualisation/GraphVisualisation";
import { useWindowResize } from "../hooks/windowHooks";
import PointPreview from "../components/GraphVisualisation/PointPreview";
import CodeEditorWindow from "../components/FilterEditorWindow";

const defaultQuery = `
{
  "limit": 5
}
`;

function Graph() {
  const theme = useTheme();
  const navigate = useNavigate();
  const params = useParams();
  const [visualizeChartHeight, setVisualizeChartHeight] = useState(0);
  const VisualizeChartWrapper = useRef(null);
  const { height } = useWindowResize();

  const [result, setResult] = useState({});
  const [code, setCode] = useState(defaultQuery);
  const getCodeParams = useCallback((param) => {
    return JSON.parse(code)[param] || null;
  }, [result]);

  const [activePoint, setActivePoint] = useState(null);
  // todo: add setOptions function
  const options = useMemo(() => ({
    limit: getCodeParams('limit'),
    filter: getCodeParams('filter'),
    using: getCodeParams('using'),
    collectionName: params.collectionName, // Assuming collectionName doesn't change often
  }), [result]);

  useEffect(() => {
    setVisualizeChartHeight(height - VisualizeChartWrapper.current?.offsetTop);
  }, [height, VisualizeChartWrapper]);

  const handlePointDisplay = useCallback((point) => {
    setActivePoint(point);
  }, []);

  return (
    <>
      <Box component="main">
        <Grid container>
          <Grid xs={12} item>
            <PanelGroup direction="horizontal" autoSaveId="persistence">
              <Panel defaultSize={50}>
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
                      <GraphVisualisation
                        options={options}
                        initialData={result}
                        onDataDisplay={handlePointDisplay}
                        wrapperRef={VisualizeChartWrapper.current}
                      />
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
                <Panel defaultSize={20}>
                  <CodeEditorWindow code={code} onChange={setCode} onChangeResult={setResult} />
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
                  <Panel defaultSize={80}
                    style={{
                    overflowY: 'scroll',
                  }}>
                    { activePoint &&
                      <PointPreview point={activePoint} />
                    }
                  </Panel>
                </PanelGroup >
              </Panel>
            </PanelGroup>
          </Grid>
        </Grid>
      </Box>
    </>
  );
}

export default Graph;
