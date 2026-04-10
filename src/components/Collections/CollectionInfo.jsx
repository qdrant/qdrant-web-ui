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
import JsonViewerCustom from '../Common/JsonViewerCustom';
import {
  makeCollectionInfoValueTypes,
  useOpenApiSchemas,
  ColorspaceProvider,
  SchemasProvider,
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

  // Compute colorspace here (outside json-viewer tree) where useTheme() resolves correctly.
  // The json-viewer bundles its own MUI, so useTheme() inside custom value renderers
  // returns a default theme instead of the project's theme.
  const { theme: infoTheme } = useJsonViewerTheme('info');
  const colorspace = useMemo(
    () => ({
      base02: infoTheme.base02,
      base08: infoTheme.base08,
      base09: infoTheme.base09,
      base0B: infoTheme.base0B,
      base0E: infoTheme.base0E,
      base0F: infoTheme.base0F,
      comment: infoTheme.base0D,
    }),
    [infoTheme],
  );

  // Load OpenAPI schemas (deduped fetch, cached as singleton promise)
  const openApiSchemas = useOpenApiSchemas();
  const valueTypes = useMemo(() => makeCollectionInfoValueTypes(openApiSchemas), [openApiSchemas]);

  return (
    <Box display="flex" flexDirection="column" gap={5}>
      <CollectionAliases collectionName={collectionName} />
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
          <ColorspaceProvider value={colorspace}>
            <SchemasProvider value={openApiSchemas}>
              <JsonViewerCustom
                theme="info"
                value={collection}
                displayDataTypes={false}
                displayObjectSize={false}
                rootName={false}
                enableClipboard={false}
                valueTypes={valueTypes}
              />
            </SchemasProvider>
          </ColorspaceProvider>
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
