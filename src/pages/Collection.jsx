import React, { useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useClient } from '../context/client-context';
import { Typography, Grid, Button, Tabs, Tab } from '@mui/material';
import PointCard from '../components/Points/PointCard';
import ErrorNotifier from '../components/ToastNotifications/ErrorNotifier';
import SimilarSerachfield from '../components/Points/SimilarSerachfield';
import { CenteredFrame } from '../components/Common/CenteredFrame';
import Box from '@mui/material/Box';
import { SnapshotsTab } from '../components/Snapshots/SnapshotsTab';

function Collection() {
  const pageSize = 10;

  const { collectionName } = useParams();
  const [points, setPoints] = React.useState(null);
  const [vector, setVector] = React.useState(null);
  const [offset, setOffset] = React.useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [recommendationIds, setRecommendationIds] = useState([]);
  const { client: qdrantClient } = useClient();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentTab, setCurrentTab] = React.useState(location.hash.slice(1) || 'points');

  const [nextPageOffset, setNextPageOffset] = React.useState(null);

  const handleTabChange = (event, newValue) => {
    if (typeof newValue !== 'string') {
      return;
    }
    setCurrentTab(newValue);
    navigate(`#${newValue}`);
  };

  const onIdsSelected = (ids, vectors) => {
    setOffset(null);
    setRecommendationIds(ids);
    if (vectors) setVector(vectors);
    if (ids.length === 0) {
      setPoints({ points: [] });
    }
  };

  React.useEffect(() => {
    const getPoints = async () => {
      if (recommendationIds.length !== 0) {
        try {
          const newPoints = await qdrantClient.recommend(collectionName, {
            positive: recommendationIds,
            limit: pageSize + (offset || 0),
            with_payload: true,
            with_vector: true,
            using: vector,
          });
          setNextPageOffset(newPoints.length);
          setPoints({ points: newPoints });
          setErrorMessage(null);
        } catch (error) {
          setErrorMessage(error.message);
          setPoints({});
        }
      } else {
        try {
          const newPoints = await qdrantClient.scroll(collectionName, {
            offset,
            limit: pageSize,
            with_vector: true,
            with_payload: true,
          });
          setPoints({
            points: [...(points?.points || []), ...(newPoints?.points || [])],
          });
          setNextPageOffset(newPoints?.next_page_offset);
          setErrorMessage(null);
        } catch (error) {
          setErrorMessage(error.message);
          setPoints({});
        }
      }
    };
    getPoints();
  }, [collectionName, offset, recommendationIds]);

  return (
    <>
      <CenteredFrame>
        {errorMessage !== null && <ErrorNotifier {...{ message: errorMessage }} />}
        <Grid container maxWidth={'xl'} spacing={3}>
          <Grid xs={12} item>
            <Typography variant="h4">{collectionName}</Typography>
          </Grid>

          <Grid xs={12} item>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={currentTab} onChange={handleTabChange} aria-label="basic tabs example">
                <Tab label="Points" value={'points'} />
                <Tab label="Snapshots" value={'snapshots'} />
                <Tab label="Visualize" component={Link} to={`${location.pathname}/visualize`} />
              </Tabs>
            </Box>
          </Grid>

          {currentTab === 'points' && (
            <>
              <Grid xs={12} item>
                <SimilarSerachfield value={recommendationIds} setValue={onIdsSelected} />
              </Grid>

              {errorMessage && (
                <Grid xs={12} item textAlign={'center'}>
                  <Typography>⚠ Error: {errorMessage}</Typography>
                </Grid>
              )}
              {!points && !errorMessage && (
                <Grid xs={12} item textAlign={'center'}>
                  <Typography> 🔃 Loading...</Typography>
                </Grid>
              )}
              {points && !errorMessage && points.points?.length === 0 && (
                <Grid xs={12} item textAlign={'center'}>
                  <Typography>📪 No Points are presents, {collectionName} is empty</Typography>
                </Grid>
              )}
              {points &&
                !errorMessage &&
                points.points?.map((point) => (
                  <Grid xs={12} item key={point.id}>
                    <PointCard point={point} setRecommendationIds={onIdsSelected} collectionName={collectionName} />
                  </Grid>
                ))}
              <Grid xs={12} item textAlign={'center'}>
                <Button
                  variant="outlined"
                  disabled={!points || !nextPageOffset}
                  onClick={() => {
                    setOffset(nextPageOffset);
                  }}
                >
                  Load More
                </Button>
              </Grid>
            </>
          )}
          {currentTab === 'snapshots' && (
            <Grid xs={12} item>
              <SnapshotsTab collectionName={collectionName} />
            </Grid>
          )}
        </Grid>
      </CenteredFrame>
    </>
  );
}

export default Collection;
