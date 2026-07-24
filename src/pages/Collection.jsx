import React, { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router';
import { Typography, Grid, Tabs, Tab, Box } from '@mui/material';
import { CenteredFrame } from '../components/Common/CenteredFrame';
import { SnapshotsTab } from '../components/Snapshots/SnapshotsTab';
import CollectionInfo from '../components/Collections/CollectionInfo';
import CollectionActionsButton from '../components/Collections/CollectionActionsButton';
import PointsTabs from '../components/Points/PointsTabs';
import SearchQuality from '../components/Collections/SearchQuality/SearchQuality';
import { useClient } from '../context/client-context';
import ClusterMonitor from '../components/Collections/ClusterMonitor/ClusterMonitor';
import Optimizations from '../components/Collections/Optimizations/Optimizations';
import Memory from '../components/Collections/Memory/Memory';
import { useScrollToId } from '../hooks/useScrollToId';

/**
 * Parse collection page hash as `#tab` or `#tab/elementId`.
 *
 * @param {string} hash - location.hash
 * @return {{tab: string, scrollToId: (string|null)}} tab and optional element id to scroll to
 */
const parseCollectionHash = (hash) => {
  const raw = (hash || '').replace(/^#/, '');
  if (!raw) {
    return { tab: 'points', scrollToId: null };
  }
  const [tab, scrollToId] = raw.split('/');
  return { tab: tab || 'points', scrollToId: scrollToId || null };
};

function Collection() {
  const { collectionName } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const initialHash = parseCollectionHash(location.hash);
  const [currentTab, setCurrentTab] = useState(initialHash.tab);
  const [scrollToId, setScrollToId] = useState(initialHash.scrollToId);
  const { client: qdrantClient, isRestricted } = useClient();
  const [hasMetadata, setHasMetadata] = useState(false);
  const [createAliasOpen, setCreateAliasOpen] = useState(false);
  const [addMetadataOpen, setAddMetadataOpen] = useState(false);
  const [createIndexOpen, setCreateIndexOpen] = useState(false);

  const refreshHasMetadata = useCallback(() => {
    qdrantClient
      .getCollection(collectionName)
      .then((res) => {
        const metadata = res?.config?.metadata;
        setHasMetadata(metadata != null && typeof metadata === 'object' && Object.keys(metadata).length > 0);
      })
      .catch(() => {
        setHasMetadata(false);
      });
  }, [qdrantClient, collectionName]);

  useEffect(() => {
    refreshHasMetadata();
  }, [refreshHasMetadata]);

  useEffect(() => {
    const { tab, scrollToId: nextScrollToId } = parseCollectionHash(location.hash);
    setCurrentTab(tab);
    setScrollToId(nextScrollToId);
  }, [location.hash]);

  const clearScrollTarget = useCallback(() => {
    setScrollToId(null);
    navigate(`#${currentTab}`, { replace: true });
  }, [navigate, currentTab]);

  useScrollToId(scrollToId, { onScrolled: clearScrollTarget });

  const handleTabChange = (event, newValue) => {
    if (typeof newValue !== 'string') {
      return;
    }
    setCurrentTab(newValue);
    setScrollToId(null);
    navigate(`#${newValue}`);
  };

  return (
    <>
      <CenteredFrame>
        <Grid container maxWidth={'xl'} width={'100%'} spacing={3}>
          <Grid
            size={12}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Typography variant="h4" component="h1" sx={{ lineHeight: 1, minWidth: 0 }}>
              {collectionName}
            </Typography>
            <Box
              aria-hidden={currentTab !== 'info'}
              sx={{
                visibility: currentTab === 'info' ? 'visible' : 'hidden',
                pointerEvents: currentTab === 'info' ? 'auto' : 'none',
                flexShrink: 0,
              }}
            >
              <CollectionActionsButton
                hasMetadata={hasMetadata}
                onCreateAlias={() => setCreateAliasOpen(true)}
                onAddMetadata={() => setAddMetadataOpen(true)}
                onCreatePayloadIndex={() => setCreateIndexOpen(true)}
              />
            </Box>
          </Grid>

          <Grid size={12}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: '2.5rem' }}>
              <Tabs
                value={currentTab}
                onChange={handleTabChange}
                aria-label="tabs"
                aria-description="Collection tabs menu"
              >
                <Tab label="Points" value={'points'} />
                <Tab label="Info" value={'info'} />
                {!isRestricted && <Tab label="Optimizations" value={'optimizations'} />}
                {!isRestricted && <Tab label="Memory" value={'memory'} />}
                {!isRestricted && <Tab label="Cluster" value={'cluster'} />}
                {!isRestricted && <Tab label="ANN Recall" value={'quality'} />}
                {!isRestricted && <Tab label="Snapshots" value={'snapshots'} />}
                <Tab
                  label="Visualize"
                  component={Link}
                  to={`/collections/${encodeURIComponent(collectionName)}/visualize`}
                />
                <Tab label="Graph" component={Link} to={`/collections/${encodeURIComponent(collectionName)}/graph`} />
              </Tabs>
            </Box>
          </Grid>

          <Grid size={12}>
            {currentTab === 'info' && (
              <CollectionInfo
                collectionName={collectionName}
                forceCreateAliasOpen={createAliasOpen}
                onForceCreateAliasClose={() => setCreateAliasOpen(false)}
                forceAddMetadataOpen={addMetadataOpen}
                onForceAddMetadataClose={() => setAddMetadataOpen(false)}
                forceCreateIndexOpen={createIndexOpen}
                onForceCreateIndexClose={() => setCreateIndexOpen(false)}
                onMetadataChange={refreshHasMetadata}
              />
            )}
            {!isRestricted && currentTab === 'quality' && <SearchQuality collectionName={collectionName} />}
            {currentTab === 'points' && <PointsTabs collectionName={collectionName} />}
            {!isRestricted && currentTab === 'snapshots' && <SnapshotsTab collectionName={collectionName} />}
            {currentTab === 'cluster' && <ClusterMonitor collectionName={collectionName} />}
            {!isRestricted && currentTab === 'optimizations' && <Optimizations collectionName={collectionName} />}
            {!isRestricted && currentTab === 'memory' && <Memory collectionName={collectionName} />}
          </Grid>
        </Grid>
      </CenteredFrame>
    </>
  );
}

export default Collection;
