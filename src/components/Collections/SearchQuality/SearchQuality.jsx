import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { getSnackbarOptions } from '../../Common/utils/snackbarOptions';
import { useClient } from '../../../context/client-context';
import SearchQualityPanel from './SearchQualityPanel';
import { useSnackbar } from 'notistack';
import { Box, Card, CardHeader } from '@mui/material';
import { CopyButton } from '../../Common/CopyButton';
import { bigIntJSON } from '../../../common/bigIntJSON';
import EditorCommon from '../../EditorCommon';
import _ from 'lodash';

const explainLog = `Example Output: [18/10/2024, 01:51:38] Point ID 1(1/100) precision@10: 0.8 (search time exact: 30ms, regular: 5ms)

Explanation:
This output compares the performance of an exact search (full kNN) versus an approximate search using ANN (Approximate Nearest Neighbor). 

- precision@10: 0.8: Out of the top 10 results returned by the exact search, 8 were also found in the ANN search.
- Search Time: The exact search took 30ms, whereas the ANN search was much faster, taking only 5ms, but with a small loss in accuracy.

Tuning the HNSW Algorithm (Advanced mode):
- "hnsw_ef" parameter: Controls how many neighbors to consider during a search. Increasing "hnsw_ef" improves precision but slows down the search.
  
Practical Use:
- The ANN search (with HNSW) is significantly faster (5ms compared to 30ms) but slightly less accurate (precision@10: 0.8). You can adjust parameters like "hnsw_ef" in advanced mode to find the right balance between speed and accuracy.

Additional Tuning Parameters (need to be set during collection configuration):
1. "m" Parameter : Defines the number of edges per node in the graph. A higher "m" value improves accuracy but uses more memory.
2. "ef_construct" Parameter: Sets the number of neighbors to consider during index creation. A higher value increases precision but requires more time during indexing.`;

const SearchQuality = ({ collectionName }) => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { client } = useClient();
  const [collection, setCollection] = React.useState(null);
  const [log, setLog] = React.useState('');

  const handleLogUpdate = (newLog) => {
    const date = new Date().toLocaleString();
    newLog = `[${date}] ${newLog}`;
    setLog((prevLog) => {
      return newLog + '\n' + prevLog;
    });
  };

  const clearLogs = () => {
    setLog(' ');
  };

  useEffect(() => {
    client
      .getCollection(collectionName)
      .then((res) => {
        setCollection(() => {
          return { ...res };
        });
      })
      .catch((err) => {
        enqueueSnackbar(err.message, getSnackbarOptions('error', closeSnackbar));
      });
  }, []);

  // Check that collection.config.params.vectors?.size exists and integer
  const isNamedVectors = !collection?.config?.params.vectors?.size && _.isObject(collection?.config?.params?.vectors);
  let vectors = {};
  if (collection) {
    vectors = isNamedVectors ? collection?.config?.params?.vectors : { '': collection?.config?.params?.vectors };
  }

  return (
    <>
      {collection?.config?.params?.vectors && (
        <SearchQualityPanel
          collectionName={collectionName}
          vectors={vectors}
          loggingFoo={handleLogUpdate}
          clearLogsFoo={clearLogs}
          sx={{ mt: 5 }}
        />
      )}

      <Card varian="dual" sx={{ mt: 5 }}>
        <CardHeader
          title={log ? 'Report' : 'What is Search Quality?'}
          variant="heading"
          sx={{
            flexGrow: 1,
          }}
          action={<CopyButton text={bigIntJSON.stringify(log)} />}
        />
        <Box sx={{ pt: 2, pb: 1, pr: 1 }}>
          <EditorCommon
            language={'custom-language'}
            theme={'custom-language-theme'}
            value={log || explainLog}
            customHeight={'calc(100vh - 660px)'}
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
    </>
  );
};

SearchQuality.propTypes = {
  collectionName: PropTypes.string,
};

export default SearchQuality;
