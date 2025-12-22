import React, { useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Typography, Grid, Tabs, Tab } from '@mui/material';
import { CenteredFrame } from '../components/Common/CenteredFrame';
import Box from '@mui/material/Box';
import { SnapshotsTab } from '../components/Snapshots/SnapshotsTab';
import CollectionInfo from '../components/Collections/CollectionInfo';
import PointsTabs from '../components/Points/PointsTabs';
import SearchQuality from '../components/Collections/SearchQuality/SearchQuality';
import { useClient } from '../context/client-context';
import ClusterMonitor from '../components/Collections/ClusterMonitor/ClusterMonitor';
import Optimizations from '../components/Collections/Optimizations/Optimizations';

function Collection() {
  const { collectionName } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentTab, setCurrentTab] = useState(location.hash.slice(1) || 'points');
  const { isRestricted } = useClient();

  const handleTabChange = (event, newValue) => {
    if (typeof newValue !== 'string') {
      return;
    }
    setCurrentTab(newValue);
    navigate(`#${newValue}`);
  };
  return (
    <>
      <CenteredFrame>
        <Grid container maxWidth={'xl'} width={'100%'}>
          <Grid size={12}>
            <Typography variant="h4" mb={3}>
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
                {!isRestricted && <Tab label="Cluster" value={'cluster'} />}
                {!isRestricted && <Tab label="Search Quality" value={'quality'} />}
                {!isRestricted && <Tab label="Snapshots" value={'snapshots'} />}
                <Tab label="Visualize" component={Link} to={`${location.pathname}/visualize`} />
                <Tab label="Graph" component={Link} to={`${location.pathname}/graph`} />
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
          </Grid>
        </Grid>
      </CenteredFrame>
    </>
  );
}

export default Collection;
