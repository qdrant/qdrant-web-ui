import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { getSnackbarOptions } from '../../Common/utils/snackbarOptions';
import { useClient } from '../../../context/client-context';
import SearchQualityPanel from './SearchQualityPanel';
import { useSnackbar } from 'notistack';
import { Box, Card, CardContent, CardHeader, Grid } from '@mui/material';
import { CopyButton } from '../../Common/CopyButton';
import { bigIntJSON } from '../../../common/bigIntJSON';
import EditorCommon from '../../EditorCommon';
import _ from 'lodash';
import * as Instruction from './Instruction.mdx';
import { mdxComponents } from '../../InteractiveTutorial/MdxComponents/MdxComponents';

const SearchQuality = ({ collectionName }) => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { client } = useClient();
  const [collection, setCollection] = React.useState(null);
  const [log, setLog] = React.useState('');

  const handleLogUpdate = (newLog) => {
    const date = new Date().toLocaleString();
    newLog = `[${date}] ${newLog}`;
    setLog((prevLog) => newLog + '\n' + prevLog);
  };

  const clearLogs = () => {
    setLog(' ');
  };

  useEffect(() => {
    client
      .getCollection(collectionName)
      .then((res) => setCollection({ ...res }))
      .catch((err) => {
        enqueueSnackbar(err.message, getSnackbarOptions('error', closeSnackbar));
      });
  }, []);

  const isNamedVectors = !collection?.config?.params.vectors?.size && _.isObject(collection?.config?.params?.vectors);
  let vectors = {};
  if (collection) {
    vectors = isNamedVectors ? collection?.config?.params?.vectors : { '': collection?.config?.params?.vectors };
  }

  return (
    <Grid
      container
      spacing={2}
      sx={{
        height: 'calc(100vh - 283px)',
      }}
    >
      <Grid
        item
        xs={12}
        md={7}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        {collection?.config?.params?.vectors && (
          <SearchQualityPanel
            collectionName={collectionName}
            vectors={vectors}
            loggingFoo={handleLogUpdate}
            clearLogsFoo={clearLogs}
            sx={{
              flexShrink: 0,
            }}
          />
        )}
        <Card
          variant="dual"
          sx={{
            mt: 2,
            flex: '1 1 auto',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <CardHeader title="What is search quality?" variant="heading" />
          <CardContent
            sx={{
              pl: 2,
              flex: '1 1 auto',
              overflowY: 'auto',
            }}
          >
            <Instruction.default components={mdxComponents} />
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={5} sx={{ height: '100%' }}>
        <Card
          sx={{
            height: '100%',
          }}
        >
          <CardHeader title="Report" action={<CopyButton text={bigIntJSON.stringify(log)} />} />
          <Box
            sx={{
              pt: 2,
              pb: 1,
              pr: 1,
              height: 'calc(100% - 60px)',
            }}
          >
            <EditorCommon
              language="custom-language"
              paddingBottom={48}
              theme="custom-language-theme"
              value={log}
              options={{
                scrollBeyondLastLine: false,
                fontSize: 12,
                wordWrap: 'on',
                minimap: { enabled: false },
                automaticLayout: true,
                readOnly: true,
                mouseWheelZoom: true,
                lineNumbers: 'off',
              }}
            />
          </Box>
        </Card>
      </Grid>
    </Grid>
  );
};

SearchQuality.propTypes = {
  collectionName: PropTypes.string,
};

export default SearchQuality;
