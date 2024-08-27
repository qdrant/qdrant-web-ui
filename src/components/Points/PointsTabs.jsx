import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import SimilarSerachfield from './SimilarSerachfield';
import PointCard from './PointCard';
import { useClient } from '../../context/client-context';
import { getErrorMessage } from '../../lib/get-error-message';
import { Button, Grid, Typography } from '@mui/material';
import ErrorNotifier from '../ToastNotifications/ErrorNotifier';

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
  const [vectors, setVectors] = useState([]);

  const onConditionChange = (conditions, usingVector) => {
    if (usingVector) {
      setUsingVector(usingVector);
    }
    setOffset(null);
    setConditions(conditions);
    setPoints({ points: [] });
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
      const vectors = [];
      Object.keys(collectionInfo.config.params.vectors).map((key) => {
        if (typeof collectionInfo.config.params.vectors[key] === 'object') {
          vectors.push(key);
        }
      });
      setVectors(vectors);
      setPayloadSchema(collectionInfo.payload_schema);
    };
    getCollection();
  }, []);

  useEffect(() => {
    const getPoints = async () => {
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
              points: [...(points?.points || []), ...(newPoints?.points || [])],
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
    <Grid container spacing={3}>
      {errorMessage !== null && <ErrorNotifier {...{ message: errorMessage }} />}
      <Grid xs={12} item>
        <SimilarSerachfield
          conditions={conditions}
          onConditionChange={onConditionChange}
          vectors={vectors}
          usingVector={usingVector}
        />
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
          <Typography>📪 No Points are present, {collectionName} is empty</Typography>
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
              payloadSchema={payloadSchema}
              client={client}
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
    </Grid>
  );
};

PointsTabs.propTypes = {
  collectionName: PropTypes.string.isRequired,
  client: PropTypes.object,
};

export default PointsTabs;
