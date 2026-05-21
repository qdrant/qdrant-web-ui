import React, { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import PointCard from './PointCard';
import PointCardSkeleton from './PointCardSkeleton';
import { useClient } from '../../context/client-context';
import { getErrorMessage } from '../../lib/get-error-message';
import { Alert, Button, Grid, Typography } from '@mui/material';
import ErrorNotifier from '../ToastNotifications/ErrorNotifier';
import PointsFilter from './PointsFilter/PointsFilter';

const PointsTabs = ({ collectionName, client }) => {
  const pageSize = 10;
  const [points, setPoints] = useState(null);
  const [offset, setOffset] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [similarIds, setSimilarIds] = useState([]);
  const [filters, setFilters] = useState([]);
  const qdrantClient = client ? client : useClient().client;
  const [nextPageOffset, setNextPageOffset] = useState(null);
  const [usingVector, setUsingVector] = useState(null);
  const [payloadSchema, setPayloadSchema] = useState({});
  const [payloadValues, setPayloadValues] = useState({});
  const [requestCount, setRequestCount] = useState(0);
  // Tracks keyword fields whose facet values have already been requested,
  // so we don't refire facet requests on every keystroke.
  const requestedFacetsRef = useRef(new Set());

  const onSimilarIdsChange = (ids, vectorName) => {
    if (vectorName !== undefined) {
      setUsingVector(vectorName);
    }
    setOffset(null);
    setSimilarIds(ids);
    setPoints(null);
  };

  const onFiltersChange = (newFilters) => {
    setOffset(null);
    setFilters(newFilters);
    setPoints(null);
  };

  const handleClearFilters = () => {
    setErrorMessage(null);
    setOffset(null);
    setSimilarIds([]);
    setUsingVector(null);
    setFilters([]);
    setPoints(null);
  };

  const onFindSimilar = (pointId, vectorName) => {
    onSimilarIdsChange([pointId], vectorName);
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
      const schema = collectionInfo.payload_schema || {};
      setPayloadSchema(schema);
      // Reset lazily-loaded facet values when switching collections.
      setPayloadValues({});
      requestedFacetsRef.current = new Set();
    };
    getCollection();
  }, [collectionName, qdrantClient]);

  // Lazily fetch facet values for a keyword field, on demand, when the user
  // references that field in the filter input. Facet requests can be expensive
  // on large collections, so we never fire them eagerly for the whole schema.
  const fetchFacetValues = useCallback(
    async (key) => {
      if (!key || requestedFacetsRef.current.has(key)) {
        return;
      }
      const fieldInfo = payloadSchema[key];
      if (!fieldInfo || fieldInfo.data_type !== 'keyword') {
        return;
      }
      requestedFacetsRef.current.add(key);
      try {
        const hits = await qdrantClient.facet(collectionName, { key, limit: 50 });
        const values = hits.hits.map((hit) => hit.value);
        if (values.length > 0) {
          setPayloadValues((prev) => ({ ...prev, [key]: values }));
        }
      } catch {
        // Silently ignore facet errors (e.g., if facet API is not available),
        // and allow a retry on a later keystroke.
        requestedFacetsRef.current.delete(key);
      }
    },
    [collectionName, qdrantClient, payloadSchema]
  );

  useEffect(() => {
    const getPoints = async () => {
      setRequestCount((prev) => prev + 1);

      // Build filter conditions from payload filters
      // Separate ID filters from payload filters
      const idFilters = filters.filter((f) => f.isIdFilter);
      const payloadFilters = filters.filter((f) => !f.isIdFilter);

      const filterConditions = payloadFilters.map((filter) => {
        if (filter.value === null || filter.value === undefined) {
          return { is_null: { key: filter.key } };
        } else if (filter.value === '') {
          return { is_empty: { key: filter.key } };
        } else if (payloadSchema[filter.key] && payloadSchema[filter.key].data_type === 'text') {
          return { key: filter.key, match: { text: filter.value } };
        } else {
          return { key: filter.key, match: { value: filter.value } };
        }
      });

      // Add has_id condition if ID filters are present
      if (idFilters.length > 0) {
        filterConditions.push({ has_id: idFilters.map((f) => f.value) });
      }

      try {
        if (similarIds.length > 0) {
          // Similarity search with optional filters
          const newPoints = await qdrantClient.query(collectionName, {
            query: {
              recommend: {
                positive: similarIds,
              },
            },
            limit: pageSize + (offset || 0),
            with_payload: true,
            with_vector: true,
            using: usingVector,
            filter: filterConditions.length > 0 ? { must: filterConditions } : undefined,
          });
          setNextPageOffset(newPoints.points.length);
          setPoints(newPoints);
          setErrorMessage(null);
        } else if (filterConditions.length > 0) {
          // Filter-only search
          const newPoints = await qdrantClient.scroll(collectionName, {
            offset,
            filter: { must: filterConditions },
            limit: pageSize,
            with_payload: true,
            with_vector: true,
          });
          setPoints({
            points: offset ? [...(points?.points || []), ...(newPoints?.points || [])] : newPoints?.points || [],
          });
          setNextPageOffset(newPoints?.next_page_offset);
          setErrorMessage(null);
        } else {
          // No filters - scroll all
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
        }
      } catch (error) {
        const message = getErrorMessage(error, { withApiKey: { apiKey: qdrantClient.getApiKey() } });
        message && setErrorMessage(message);
        setPoints({});
      } finally {
        setRequestCount((prev) => prev - 1);
      }
    };
    getPoints();
  }, [collectionName, offset, similarIds, filters]);
  const isLoading = !points && !errorMessage && requestCount > 0;

  return (
    <Grid container spacing={3} role="list" aria-label="Collection Points">
      {/* Always render PointsFilter so users can clear or change filters after an error */}
      <Grid size={12}>
        <PointsFilter
          similarIds={similarIds}
          filters={filters}
          onSimilarIdsChange={onSimilarIdsChange}
          onFiltersChange={onFiltersChange}
          payloadSchema={payloadSchema}
          payloadValues={payloadValues}
          onRequestFacetValues={fetchFacetValues}
          points={points}
        />
      </Grid>
      {errorMessage !== null && <ErrorNotifier {...{ message: errorMessage }} />}
      {errorMessage && (
        <Grid size={12}>
          <Alert
            severity="error"
            action={
              filters.length > 0 ? (
                <Button variant="outlined" size="small" color="inherit" onClick={handleClearFilters}>
                  Clear Filters
                </Button>
              ) : undefined
            }
          >
            {errorMessage}
          </Alert>
        </Grid>
      )}
      {isLoading && (
        <>
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
                onFindSimilar={onFindSimilar}
                collectionName={collectionName}
                deletePoint={deletePoint}
                payloadSchema={payloadSchema}
                client={client}
              />
            </Grid>
          ))}
        </>
      )}
      {points?.points?.length > 0 && nextPageOffset && (
        <Grid textAlign={'center'} size={12}>
          <Button
            variant="outlined"
            onClick={() => {
              setOffset(nextPageOffset);
            }}
          >
            Load More
          </Button>
        </Grid>
      )}
    </Grid>
  );
};

PointsTabs.propTypes = {
  collectionName: PropTypes.string.isRequired,
  client: PropTypes.object,
};

export default PointsTabs;
