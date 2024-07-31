import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { alpha, Paper, Box, Tooltip, Typography, Grid, IconButton } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import CodeEditorWindow from '../components/FilterEditorWindow';
import { useSnackbar } from 'notistack';
import IndexAccuracyCheckResult from '../components/Collections/CollectionVectors/IndexAccuracyCheckResult';

function IndexAccuracyCheck() {
  const theme = useTheme();
  const navigate = useNavigate();
  const params = useParams();
  const { enqueueSnackbar } = useSnackbar();

  const [vectors, setVectors] = useState(null);
  const [code, setCode] = useState(`// code here`);

  const handleRunCode = async (data, collectionName) => {
    try {
      console.log('request', data, collectionName);
    } catch (e) {
      enqueueSnackbar(e.message, { variant: 'error' });
    }
  };

  useEffect(() => {
    // get vectors
    setVectors([]);
  }, []);

  return (
    <>
      <Box component="main">
        <Grid container>
          <Grid xs={12} item>
            <PanelGroup direction="horizontal">
              <Panel>
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
                          onClick={() => navigate(`/collections/${params.collectionName}#info`)}
                        >
                          <ArrowBack />
                        </IconButton>
                      </Tooltip>
                      <Typography variant="h6">{params.collectionName}</Typography>
                    </Paper>
                  </Box>

                  <Box>
                    <IndexAccuracyCheckResult vectors={vectors} />
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
                <Panel>
                  <CodeEditorWindow
                    code={code}
                    onChange={setCode}
                    onChangeResult={handleRunCode}
                    customRequestSchema={() => {}}
                  />
                </Panel>
              </Panel>
            </PanelGroup>
          </Grid>
        </Grid>
      </Box>
    </>
  );
}

export default IndexAccuracyCheck;
