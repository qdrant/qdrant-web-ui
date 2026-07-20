import React, { memo, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Box, Button, Card, CardContent, CardHeader, IconButton, Tooltip } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useClient } from '../../context/client-context';
import { CopyButton } from '../Common/CopyButton';
import ClusterInfo from './CollectionCluster/ClusterInfo';
import { useSnackbar } from 'notistack';
import { getSnackbarOptions } from '../Common/utils/snackbarOptions';
import { bigIntJSON } from '../../common/bigIntJSON';
import CollectionAliases from './CollectionAliases';
import CollectionMetadata from './CollectionMetadata';
import PayloadIndexesCard from './PayloadIndexesCard';
import JsonViewerCustom from '../Common/JsonViewerCustom';
import {
  DescriptionRow,
  useOpenApiSchemas,
  ColorspaceProvider,
  SchemasProvider,
  PathMapProvider,
  buildPathMap,
} from './CollectionInfoKeyRenderer';
import { useJsonViewerTheme } from '../../theme/json-viewer-theme';

export const CollectionInfo = ({ collectionName }) => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { client: qdrantClient, isRestricted } = useClient();
  const [collection, setCollection] = React.useState({});
  const [clusterInfo, setClusterInfo] = React.useState(null);

  const fetchClusterInfo = () => {
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
  };

  const refreshAll = () => {
    fetchCollection();
    fetchClusterInfo();
  };

  useEffect(() => {
    refreshAll();
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

  const { colorspace } = useJsonViewerTheme('info');
  const colorspaceSubset = useMemo(
    () => ({
      base02: colorspace.base02,
      base08: colorspace.base08,
      base09: colorspace.base09,
      base0B: colorspace.base0B,
      base0E: colorspace.base0E,
      base0F: colorspace.base0F,
      comment: colorspace.comment,
    }),
    [colorspace]
  );

  const pathMap = useMemo(() => buildPathMap(collection), [collection]);

  const openApiSchemas = useOpenApiSchemas();

  return (
    <Box display="flex" flexDirection="column" gap={5}>
      <CollectionAliases collectionName={collectionName} />
      <CollectionMetadata metadata={collection.config?.metadata} />
      <Card elevation={0}>
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
              <Tooltip title="Refresh collection info">
                <IconButton size="small" sx={{ color: 'text.primary' }} onClick={refreshAll}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>
          }
        />
        <CardContent>
          <ColorspaceProvider value={colorspaceSubset}>
            <SchemasProvider value={openApiSchemas}>
              <PathMapProvider value={pathMap}>
                <JsonViewerCustom
                  theme="info"
                  value={collection}
                  displayDataTypes={false}
                  displayObjectSize={false}
                  enableClipboard={false}
                >
                  {openApiSchemas && <DescriptionRow />}
                </JsonViewerCustom>
              </PathMapProvider>
            </SchemasProvider>
          </ColorspaceProvider>
        </CardContent>
      </Card>

      <PayloadIndexesCard
        collectionName={collectionName}
        payloadSchema={collection.payload_schema}
        onSchemaChange={fetchCollection}
      />

      {clusterInfo && <ClusterInfo collectionCluster={clusterInfo} />}
    </Box>
  );
};

CollectionInfo.displayName = 'CollectionInfo';

CollectionInfo.propTypes = {
  collectionName: PropTypes.string.isRequired,
};

export default memo(CollectionInfo);
