import React, { memo, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Button, CardContent, IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import { keyframes } from '@mui/material/styles';
import RefreshIcon from '@mui/icons-material/Refresh';
import { Check, ChevronDown, Clock } from 'lucide-react';
import { useClient } from '../../context/client-context';
import { CopyButton } from '../Common/CopyButton';
import ClusterInfo from './CollectionCluster/ClusterInfo';
import { useSnackbar } from 'notistack';
import { getSnackbarOptions } from '../Common/utils/snackbarOptions';
import { bigIntJSON } from '../../common/bigIntJSON';
import CollectionAliases from './CollectionAliases';
import CollectionMetadata from './Metadata/CollectionMetadata';
import CollectionActionsButton from './CollectionActionsButton';
import PayloadIndexesCard from './PayloadIndexesCard';
import JsonViewerCustom from '../Common/JsonViewerCustom';
import CollapsibleCard from '../Common/CollapsibleCard';
import {
  DescriptionRow,
  useOpenApiSchemas,
  ColorspaceProvider,
  SchemasProvider,
  PathMapProvider,
  buildPathMap,
} from './CollectionInfoKeyRenderer';
import { useJsonViewerTheme } from '../../theme/json-viewer-theme';
import { useAutoRefresh } from '../../hooks/useAutoRefresh';

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const REFRESH_INTERVAL_OPTIONS = [
  { value: 0, label: 'Off' },
  { value: 5_000, label: '5s' },
  { value: 10_000, label: '10s' },
  { value: 30_000, label: '30s' },
  { value: 60_000, label: '1m' },
  { value: 300_000, label: '5m' },
];

export const CollectionInfo = ({ collectionName }) => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { client: qdrantClient, isRestricted } = useClient();
  const [collection, setCollection] = React.useState({});
  const [clusterInfo, setClusterInfo] = React.useState(null);
  const [createAliasOpen, setCreateAliasOpen] = useState(false);
  const [addMetadataOpen, setAddMetadataOpen] = useState(false);
  const [createIndexOpen, setCreateIndexOpen] = useState(false);
  const [refreshIntervalMs, setRefreshIntervalMs] = useState(0);
  const [refreshAnchorEl, setRefreshAnchorEl] = useState(null);
  const refreshMenuOpen = Boolean(refreshAnchorEl);
  const refreshIntervalLabel =
    REFRESH_INTERVAL_OPTIONS.find(({ value }) => value === refreshIntervalMs)?.label || 'Off';

  const fetchClusterInfo = (silent = false) => {
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
        if (!silent) {
          enqueueSnackbar(err.message, getSnackbarOptions('error', closeSnackbar));
        }
      });
  };

  const hasMetadata =
    collection.config?.metadata != null &&
    typeof collection.config.metadata === 'object' &&
    Object.keys(collection.config.metadata).length > 0;

  const fetchCollection = (silent = false) => {
    qdrantClient
      .getCollection(collectionName)
      .then((res) => {
        setCollection(() => {
          return { ...res };
        });
      })
      .catch((err) => {
        if (!silent) {
          enqueueSnackbar(err.message, getSnackbarOptions('error', closeSnackbar));
        }
      });
  };

  const refreshAll = (silent = false) => {
    fetchCollection(silent);
    fetchClusterInfo(silent);
  };

  useEffect(() => {
    refreshAll();
  }, [collectionName]);

  const { isRefreshing } = useAutoRefresh({
    enabled: refreshIntervalMs > 0,
    intervalMs: refreshIntervalMs,
    onTick: () => refreshAll(true),
  });

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

  const triggerOptimizersDisabled =
    collection.status === 'green' ||
    collection.optimizer_status?.error === `optimizations pending, awaiting update operation`;

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

  const metadata = collection.config?.metadata;

  return (
    <Box display="flex" flexDirection="column" gap={5}>
      <CollectionAliases
        collectionName={collectionName}
        forceCreateOpen={createAliasOpen}
        onForceCreateClose={() => setCreateAliasOpen(false)}
      />
      <CollapsibleCard
        title="Collection Info"
        action={
          <Box display="flex" gap={1} alignItems="center">
            <CollectionActionsButton
              hasMetadata={hasMetadata}
              onCreateAlias={() => setCreateAliasOpen(true)}
              onAddMetadata={() => setAddMetadataOpen(true)}
              onCreatePayloadIndex={() => setCreateIndexOpen(true)}
              onTriggerOptimizers={triggerOptimizers}
              triggerOptimizersDisabled={triggerOptimizersDisabled}
            />
            <CopyButton text={bigIntJSON.stringify(collection)} />
            <Button
              variant="outlined"
              size="small"
              startIcon={<Clock size={16} />}
              endIcon={<ChevronDown size={16} />}
              onClick={(e) => setRefreshAnchorEl(e.currentTarget)}
              aria-label="Auto refresh interval"
              aria-haspopup="true"
              aria-expanded={refreshMenuOpen ? 'true' : undefined}
              sx={{ py: 0.75, mb: 0.2 }}
            >
              {refreshIntervalLabel}
            </Button>
            <Menu
              anchorEl={refreshAnchorEl}
              open={refreshMenuOpen}
              onClose={() => setRefreshAnchorEl(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              {REFRESH_INTERVAL_OPTIONS.map(({ value, label }) => (
                <MenuItem
                  key={value}
                  value={value}
                  selected={value === refreshIntervalMs}
                  onClick={() => setRefreshIntervalMs(value)}
                  sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}
                >
                  {label}
                  {value === refreshIntervalMs && <Check size={16} />}
                </MenuItem>
              ))}
            </Menu>
            <Tooltip title="Refresh collection info">
              <IconButton
                size="small"
                aria-label="Refresh collection info"
                sx={{ color: 'text.primary' }}
                onClick={() => refreshAll()}
              >
                <RefreshIcon sx={{ animation: isRefreshing ? `${spin} 1s linear infinite` : 'none' }} />
              </IconButton>
            </Tooltip>
          </Box>
        }
      >
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
      </CollapsibleCard>
      <CollectionMetadata
        collectionName={collectionName}
        metadata={metadata}
        onMetadataChange={fetchCollection}
        forceAddOpen={addMetadataOpen}
        onForceAddClose={() => setAddMetadataOpen(false)}
      />

      <PayloadIndexesCard
        collectionName={collectionName}
        payloadSchema={collection.payload_schema}
        onSchemaChange={fetchCollection}
        forceCreateOpen={createIndexOpen}
        onForceCreateClose={() => setCreateIndexOpen(false)}
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
