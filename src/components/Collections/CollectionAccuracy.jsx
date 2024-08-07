import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { getSnackbarOptions } from '../Common/utils/snackbarOptions';
import { useClient } from '../../context/client-context';
import VectorsInfo from './CollectionVectors/VectorsInfo';
import { useSnackbar } from 'notistack';
import { Box, Card, CardHeader } from '@mui/material';
import { CopyButton } from '../Common/CopyButton';
import { bigIntJSON } from '../../common/bigIntJSON';
import EditorCommon from '../EditorCommon';

const CollectionAccuracy = ({ collectionName }) => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { client } = useClient();
  const [collection, setCollection] = React.useState({});
  const [log, setLog] = React.useState('');

  const handleLogUpdate = (newLog) => {
    const date = new Date().toLocaleString();
    newLog = `[${date}] ${newLog}`;
    setLog((prevLog) => {
      return newLog + '\n' + prevLog;
    });
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

  return (
    <>
      {collection?.config?.params?.vectors && (
        <VectorsInfo
          collectionName={collectionName}
          vectors={collection.config.params.vectors}
          onRequestResult={handleLogUpdate}
          sx={{ mt: 5 }}
        />
      )}

      <Card varian="dual" sx={{ mt: 5 }}>
        <CardHeader
          title={'Report'}
          variant="heading"
          sx={{
            flexGrow: 1,
          }}
          action={<CopyButton text={bigIntJSON.stringify(log)} />}
        />
        <Box sx={{ pt: 2, pb: 1, pr: 1 }}>
          <EditorCommon
            theme={'custom-language-theme'}
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
    </>
  );
};

CollectionAccuracy.propTypes = {
  collectionName: PropTypes.string,
};

export default CollectionAccuracy;
