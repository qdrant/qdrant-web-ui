import React, { memo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, Button, Card, CardContent, CardHeader } from '@mui/material';
import { useClient } from '../../context/client-context';
import { CopyButton } from '../Common/CopyButton';
import ClusterInfo from './CollectionCluster/ClusterInfo';
import { useSnackbar } from 'notistack';
import { getSnackbarOptions } from '../Common/utils/snackbarOptions';
import { bigIntJSON } from '../../common/bigIntJSON';
import CollectionAliases from './CollectionAliases';
import JsonViewerCustom from '../Common/JsonViewerCustom';

export const CollectionInfo = ({ collectionName }) => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { client: qdrantClient, isRestricted } = useClient();
  const [collection, setCollection] = React.useState({});
  const [clusterInfo, setClusterInfo] = React.useState(null);

  useEffect(() => {
    fetchCollection();

    if (isRestricted) {
      return;
    }

    qdrantClient
      .api('cluster')
      .collectionClusterInfo({ collection_name: collectionName })
      .then((res) => {
        setClusterInfo(() => {
          return { ...res.data };
        });
      })
      .catch((err) => {
        enqueueSnackbar(err.message, getSnackbarOptions('error', closeSnackbar));
      });
  }, [collectionName]);

  const fetchCollection = () => {
    qdrantClient
      .getCollection(collectionName)
      .then((res) => {
        setCollection(() => {
          return { ...res };
        });
      })
      .catch((err) => {
        enqueueSnackbar(err.message, getSnackbarOptions('error', closeSnackbar));
      });
  };

  const triggerOptimizers = () => {
    qdrantClient
      .updateCollection(collectionName, {
        optimizers_config: {},
      })
      .then(() => {
        enqueueSnackbar('Optimizers triggered', getSnackbarOptions('success', closeSnackbar));
        fetchCollection();
      })
      .catch((err) => {
        enqueueSnackbar(err.message, getSnackbarOptions('error', closeSnackbar));
      });
  };

  return (
    <Box pt={2}>
      <CollectionAliases collectionName={collectionName} />
      <Card variant="dual">
        <CardHeader
          title={'Collection Info'}
          variant="heading"
          sx={{
            flexGrow: 1,
          }}
          action={
            <Box display="flex" gap={1}>
              <Button
                variant="contained"
                size="small"
                onClick={triggerOptimizers}
                disabled={
                  collection.status === 'green' ||
                  collection.optimizer_status?.error === `optimizations pending, awaiting update operation`
                }
                sx={{
                  py: 0.75,
                  mb: 0.2,
                }}
              >
                Trigger optimizers
              </Button>
              <CopyButton text={bigIntJSON.stringify(collection)} />
            </Box>
          }
        />
        <CardContent>
          <JsonViewerCustom
            // theme="info todo: make it possible
            value={collection}
            displayDataTypes={false}
            displayObjectSize={false}
            rootName={false}
            enableClipboard={false}
          />
        </CardContent>
      </Card>

      {clusterInfo && <ClusterInfo sx={{ mt: 5 }} collectionCluster={clusterInfo} />}
    </Box>
  );
};

CollectionInfo.displayName = 'CollectionInfo';

CollectionInfo.propTypes = {
  collectionName: PropTypes.string.isRequired,
};

export default memo(CollectionInfo);
