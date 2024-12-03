import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Typography, Grid, Tabs, Tab } from '@mui/material';
import { CenteredFrame } from '../components/Common/CenteredFrame';
import Box from '@mui/material/Box';
import { SnapshotsTab } from '../components/Snapshots/SnapshotsTab';
import CollectionInfo from '../components/Collections/CollectionInfo';
import PointsTabs from '../components/Points/PointsTabs';
import SearchQuality from '../components/Collections/SearchQuality/SearchQuality';
import { useClient } from '../context/client-context';

function Collection() {
  const { collectionName } = useParams();
  const { client: qdrantClient } = useClient();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentTab, setCurrentTab] = useState(location.hash.slice(1) || 'points');
  const [isDense, setIsDense] = useState(false);

  useEffect(() => {
    const checkDenseView = async () => {
      const collectionData = await qdrantClient.getCollection(collectionName);
      const vectors = collectionData.config.params.vectors;
      if (vectors && vectors.size && vectors.distance && !vectors.multivector_config) {
        setIsDense(true);
        return;
      }
      const vectorNames = Object.keys(vectors);
      const dense = vectorNames.some((vectorName) => {
        return vectors[vectorName].size && vectors[vectorName].distance && !vectors[vectorName].multivector_config;
      });
      setIsDense(dense);
    };
    checkDenseView();
  }, [collectionName, qdrantClient]);

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
        <Grid container maxWidth={'xl'} spacing={3}>
          <Grid xs={12} item>
            <Typography variant="h4">{collectionName}</Typography>
          </Grid>

          <Grid xs={12} item>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={currentTab} onChange={handleTabChange} aria-label="basic tabs example">
                <Tab label="Points" value={'points'} />
                <Tab label="Info" value={'info'} />
                <Tab label="Search Quality" value={'quality'} />
                <Tab label="Snapshots" value={'snapshots'} />
                <Tab label="Visualize" component={Link} to={`${location.pathname}/visualize`} disabled={!isDense} />
                <Tab label="Graph" component={Link} to={`${location.pathname}/graph`} />
              </Tabs>
            </Box>
          </Grid>

          <Grid xs={12} item>
            {currentTab === 'info' && <CollectionInfo collectionName={collectionName} />}
            {currentTab === 'quality' && <SearchQuality collectionName={collectionName} />}
            {currentTab === 'points' && <PointsTabs collectionName={collectionName} />}
            {currentTab === 'snapshots' && <SnapshotsTab collectionName={collectionName} />}
          </Grid>
        </Grid>
      </CenteredFrame>
    </>
  );
}

export default Collection;
