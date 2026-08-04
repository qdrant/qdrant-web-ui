import React, { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router';
import { Typography, Grid, Tabs, Tab, Box } from '@mui/material';
import { CenteredFrame } from '../components/Common/CenteredFrame';
import { PAGE_CONTENT_WIDTH } from '../theme/constants';
import { SnapshotsTab } from '../components/Snapshots/SnapshotsTab';
import CollectionInfo from '../components/Collections/CollectionInfo';
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
  const { isRestricted } = useClient();

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
        <Grid container maxWidth={PAGE_CONTENT_WIDTH.wide} width={'100%'} spacing={3}>
          <Grid size={12}>
            <Typography variant="h4" component="h1">
              {collectionName}
            </Typography>
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
            {currentTab === 'info' && <CollectionInfo collectionName={collectionName} />}
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
