import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { getSnackbarOptions } from '../../Common/utils/snackbarOptions';
import { useClient } from '../../../context/client-context';
import SearchQualityPanel from './SearchQualityPanel';
import { useSnackbar } from 'notistack';
import { Box, Card, CardHeader } from '@mui/material';
import { CopyButton } from '../../Common/CopyButton';
import { bigIntJSON } from '../../../common/bigIntJSON';
import CodeEditor from '../../Common/CodeEditor';
import { normalizeVectorConfigObject } from '../../../lib/qdrant-entities-helpers';

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
    setLog('');
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

  let vectors = {};
  if (collection) {
    vectors = normalizeVectorConfigObject(collection);
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

      <Card elevation={0} sx={{ mt: 5 }}>
        <CardHeader
          title={'Report'}
          variant="heading"
          sx={{
            flexGrow: 1,
          }}
          action={<CopyButton text={bigIntJSON.stringify(log)} />}
        />
        <Box sx={{ pr: 1 }}>
          <CodeEditor value={log} language="markdown" readOnly={true} />
        </Box>
      </Card>
    </>
  );
};

SearchQuality.propTypes = {
  collectionName: PropTypes.string,
};

export default SearchQuality;
