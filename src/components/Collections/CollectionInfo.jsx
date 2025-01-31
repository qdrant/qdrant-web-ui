import React, { memo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, Button, Card, CardContent, CardHeader, Typography } from '@mui/material';
import { useClient } from '../../context/client-context';
import { DataGridList } from '../Points/DataGridList';
import { CopyButton } from '../Common/CopyButton';
import { Dot } from '../Common/Dot';
import ClusterInfo from './CollectionCluster/ClusterInfo';
import { useSnackbar } from 'notistack';
import { getSnackbarOptions } from '../Common/utils/snackbarOptions';
import { bigIntJSON } from '../../common/bigIntJSON';

export const CollectionInfo = ({ collectionName }) => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { client: qdrantClient, isRestricted } = useClient();
  const [collection, setCollection] = React.useState({});
  const [clusterInfo, setClusterInfo] = React.useState(null);

  useEffect(() => {
    fetchCollection();
    if (!isRestricted) {
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
    }
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
      <Card variant="dual">
        <CardHeader
          title={'Collection Info'}
          variant="heading"
          sx={{
            flexGrow: 1,
          }}
          action={<CopyButton text={bigIntJSON.stringify(collection)} />}
        />
        <CardContent>
          <DataGridList
            data={collection}
            specialCases={{
              status: (
                <Box display="flex" alignItems="center" justifyContent={'space-between'}>
                  <Typography variant="subtitle1" color="text.secondary">
                    {collection.status} <Dot color={collection.status} />
                  </Typography>
                  {(collection.status === 'grey' ||
                    collection.optimizer_status?.error === `optimizations pending, awaiting update operation`) && (
                    <Button variant="outlined" size="small" onClick={triggerOptimizers}>
                      Trigger optimizers
                    </Button>
                  )}
                </Box>
              ),
            }}
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
