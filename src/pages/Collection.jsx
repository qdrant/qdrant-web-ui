import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useClient } from '../context/client-context';
import { Typography, Grid, Button, Tabs, Tab } from '@mui/material';
import PointCard from '../components/Points/PointCard';
import ErrorNotifier from '../components/ToastNotifications/ErrorNotifier';
import SimilarSerachfield from '../components/Points/SimilarSerachfield';
import { CenteredFrame } from '../components/Common/CenteredFrame';
import Box from '@mui/material/Box';
import { SnapshotsTab } from '../components/Snapshots/SnapshotsTab';
import CollectionInfo from '../components/Collections/CollectionInfo';
import { getErrorMessage } from '../lib/get-error-message';

function Collection() {
  const pageSize = 10;

  const { collectionName } = useParams();
  const [points, setPoints] = useState(null);
  const [usingVector, setUsingVector] = useState(null);
  const [offset, setOffset] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [conditions, setConditions] = useState([]);
  const [filters, setFilters] = useState([]);
  const [recommendationIds, setRecommendationIds] = useState([]);
  const { client: qdrantClient } = useClient();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentTab, setCurrentTab] = useState(location.hash.slice(1) || 'points');

  const [nextPageOffset, setNextPageOffset] = useState(null);

  const handleTabChange = (event, newValue) => {
    if (typeof newValue !== 'string') {
      return;
    }
    setCurrentTab(newValue);
    navigate(`#${newValue}`);
  };

  const onConditionChange = (conditions) => {
    setOffset(null);
    conditions.forEach((condition) => {
      if (condition.type === 'id') {
        setRecommendationIds([...recommendationIds, condition.value]);
        if (condition.using) {
          setUsingVector(condition.using);
        }
      } else if (condition.type === 'payload') {
        setFilters([...filters, { key: condition.key, match: { value: condition.value } }]);
      }
    });
    setConditions(conditions);

    if (conditions.length === 0) {
      setPoints({ points: [] });
    }
  };

  const deletePoint = (collectionName, pointIds) => {
    return qdrantClient.delete(collectionName, { points: pointIds }).catch((error) => {
      console.log(error);
      const message = getErrorMessage(error, { withApiKey: { apiKey: qdrantClient.getApiKey() } });
      message && setErrorMessage(message);
    });
  };

  useEffect(() => {
    const getPoints = async () => {
      if (conditions.length !== 0) {
        try {
          if (recommendationIds.length !== 0) {
            const newPoints = await qdrantClient.recommend(collectionName, {
              positive: recommendationIds,
              limit: pageSize + (offset || 0),
              with_payload: true,
              with_vector: true,
              using: usingVector,
              filter: {
                must: filters,
              },
            });
            setNextPageOffset(newPoints.length);
            setPoints({ points: newPoints });
            setErrorMessage(null);
          } else if (filters.length !== 0) {
            const newPoints = await qdrantClient.scroll(collectionName, {
              filter: {
                must: filters,
              },
              limit: pageSize + (offset || 0),
              with_payload: true,
              with_vector: true,
            });
            setPoints({
              points: [...(newPoints?.points || [])],
            });
            setNextPageOffset(newPoints?.next_page_offset);
            setErrorMessage(null);
          }
        } catch (error) {
          const message = getErrorMessage(error, { withApiKey: { apiKey: qdrantClient.getApiKey() } });
          message && setErrorMessage(message);
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
          const message = getErrorMessage(error, { withApiKey: { apiKey: qdrantClient.getApiKey() } });
          message && setErrorMessage(message);
          setPoints({});
        }
      }
    };
    getPoints();
  }, [collectionName, offset, conditions]);

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
                <Tab label="Info" value={'info'} />
                <Tab label="Snapshots" value={'snapshots'} />
                <Tab label="Visualize" component={Link} to={`${location.pathname}/visualize`} />
              </Tabs>
            </Box>
          </Grid>

          {currentTab === 'info' && (
            <Grid xs={12} item>
              <CollectionInfo collectionName={collectionName} />
            </Grid>
          )}
          {currentTab === 'points' && (
            <>
              <Grid xs={12} item>
                <SimilarSerachfield value={conditions} onConditionChange={onConditionChange} />
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
                    <PointCard
                      point={point}
                      onConditionChange={onConditionChange}
                      conditions={conditions}
                      collectionName={collectionName}
                      deletePoint={deletePoint}
                    />
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
