import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import PointCard from './PointCard';
import PointCardSkeleton from './PointCardSkeleton';
import { useClient } from '../../context/client-context';
import { getErrorMessage } from '../../lib/get-error-message';
import { Button, Grid, Typography } from '@mui/material';
import ErrorNotifier from '../ToastNotifications/ErrorNotifier';
import PointsFilter from './PointsFilter/PointsFilter';

const PointsTabs = ({ collectionName, client }) => {
  const pageSize = 10;
  const [points, setPoints] = useState(null);
  const [offset, setOffset] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [conditions, setConditions] = useState([]);
  const qdrantClient = client ? client : useClient().client;
  const [nextPageOffset, setNextPageOffset] = useState(null);
  const [usingVector, setUsingVector] = useState(null);
  const [payloadSchema, setPayloadSchema] = useState({});
  const [requestCount, setRequestCount] = useState(0);

  const onConditionChange = (conditions, usingVector) => {
    if (usingVector) {
      setUsingVector(usingVector);
    }
    setOffset(null);
    setConditions(conditions);
    setPoints(null);
  };

  const deletePoint = (collectionName, pointIds) => {
    return qdrantClient.delete(collectionName, { points: pointIds }).catch((error) => {
      console.log(error);
      const message = getErrorMessage(error, { withApiKey: { apiKey: qdrantClient.getApiKey() } });
      message && setErrorMessage(message);
    });
  };

  useEffect(() => {
    const getCollection = async () => {
      const collectionInfo = await qdrantClient.getCollection(collectionName);
      setPayloadSchema(collectionInfo.payload_schema);
    };
    getCollection();
  }, [collectionName, qdrantClient]);

  useEffect(() => {
    const getPoints = async () => {
      setRequestCount((prev) => prev + 1);
      if (conditions.length !== 0) {
        const recommendationIds = [];
        const filters = [];
        conditions.forEach((condition) => {
          if (condition.type === 'id') {
            recommendationIds.push(condition.value);
          } else if (condition.type === 'payload') {
            if (condition.value === null || condition.value === undefined) {
              filters.push({
                is_null: {
                  key: condition.key,
                },
              });
            } else if (condition.value === '') {
              filters.push({
                is_empty: {
                  key: condition.key,
                },
              });
            } else if (payloadSchema[condition.key] && payloadSchema[condition.key].data_type === 'text') {
              filters.push({ key: condition.key, match: { text: condition.value } });
            } else {
              filters.push({ key: condition.key, match: { value: condition.value } });
            }
          }
        });
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
              offset,
              filter: {
                must: filters,
              },
              limit: pageSize,
              with_payload: true,
              with_vector: true,
            });
            setPoints({
              points: offset ? [...(points?.points || []), ...(newPoints?.points || [])] : newPoints?.points || [],
            });
            setNextPageOffset(newPoints?.next_page_offset);
            setErrorMessage(null);
          }
        } catch (error) {
          const message = getErrorMessage(error, { withApiKey: { apiKey: qdrantClient.getApiKey() } });
          message && setErrorMessage(message);
          setPoints({});
        } finally {
          setRequestCount((prev) => prev - 1);
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
            points: offset ? [...(points?.points || []), ...(newPoints?.points || [])] : newPoints?.points || [],
          });
          setNextPageOffset(newPoints?.next_page_offset);
          setErrorMessage(null);
        } catch (error) {
          const message = getErrorMessage(error, { withApiKey: { apiKey: qdrantClient.getApiKey() } });
          message && setErrorMessage(message);
          setPoints({});
        } finally {
          setRequestCount((prev) => prev - 1);
        }
      }
    };
    getPoints();
  }, [collectionName, offset, conditions]);
  const isLoading = !points && !errorMessage && requestCount > 0;

  return (
    <Grid container spacing={3} role="list" aria-label="Collection Points">
      {errorMessage !== null && <ErrorNotifier {...{ message: errorMessage }} />}
      {errorMessage && (
        <Grid textAlign={'center'} size={12}>
          <Typography>⚠ Error: {errorMessage}</Typography>
        </Grid>
      )}
      {!isLoading && !errorMessage && (
        <Grid size={12}>
          <PointsFilter
            onConditionChange={onConditionChange}
            conditions={conditions}
            payloadSchema={payloadSchema}
            points={points}
          />
        </Grid>
      )}
      {isLoading && (
        <>
          <Grid size={12}>
            <PointsFilter
              onConditionChange={onConditionChange}
              conditions={conditions}
              payloadSchema={payloadSchema}
              points={null}
            />
          </Grid>
          {Array.from({ length: pageSize }).map((_, index) => (
            <Grid key={`skeleton-${index}`} size={12}>
              <PointCardSkeleton />
            </Grid>
          ))}
        </>
      )}
      {points && !errorMessage && requestCount === 0 && points.points?.length === 0 && (
        <Grid textAlign={'center'} size={12} role="alert" aria-label="No Points">
          <Typography>📪 No Points are present, {collectionName} is empty</Typography>
        </Grid>
      )}
      {points && !errorMessage && points.points?.length > 0 && (
        <>
          {points.points?.map((point) => (
            <Grid key={point.id} size={12}>
              <PointCard
                point={point}
                onConditionChange={onConditionChange}
                conditions={conditions}
                collectionName={collectionName}
                deletePoint={deletePoint}
                payloadSchema={payloadSchema}
                client={client}
              />
            </Grid>
          ))}
        </>
      )}
      <Grid textAlign={'center'} size={12}>
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
    </Grid>
  );
};

PointsTabs.propTypes = {
  collectionName: PropTypes.string.isRequired,
  client: PropTypes.object,
};

export default PointsTabs;
