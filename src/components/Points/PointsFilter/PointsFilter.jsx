import React, { useMemo, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Box, Grid } from '@mui/material';

import SimilarSearchField from './SimilarSearchField';
import PayloadFilterField from './PayloadFilterField';

const PointsFilter = ({
  similarIds = [],
  filters = [],
  onSimilarIdsChange,
  onFiltersChange,
  payloadSchema = {},
  payloadValues = {},
  points,
}) => {
  const [isSimilarExpanded, setIsSimilarExpanded] = useState(false);

  const payloadKeyOptions = useMemo(() => {
    const keys = new Set();
    Object.keys(points?.payload_schema || {}).forEach((key) => keys.add(key));
    Object.keys(payloadSchema || {}).forEach((key) => keys.add(key));
    return [...keys];
  }, [points, payloadSchema]);

  const handleExpandChange = useCallback((expanded) => {
    setIsSimilarExpanded(expanded);
  }, []);

  return (
    <Box>
      <Grid container spacing={1}>
        {/* Similar search field (with chips) */}
        <Grid size={{ xs: 12, md: isSimilarExpanded ? 12 : 3 }}>
          <SimilarSearchField
            similarIds={similarIds}
            onSimilarIdsChange={onSimilarIdsChange}
            isExpanded={isSimilarExpanded}
            onExpandChange={handleExpandChange}
          />
        </Grid>

        {/* Payload filter field (with syntax highlighting) */}
        <Grid size={{ xs: 12, md: isSimilarExpanded ? 12 : 9 }}>
          <PayloadFilterField
            filters={filters}
            onFiltersChange={onFiltersChange}
            payloadSchema={payloadSchema}
            payloadKeyOptions={payloadKeyOptions}
            payloadValues={payloadValues}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

PointsFilter.propTypes = {
  similarIds: PropTypes.array,
  filters: PropTypes.array,
  onSimilarIdsChange: PropTypes.func.isRequired,
  onFiltersChange: PropTypes.func.isRequired,
  payloadSchema: PropTypes.object,
  payloadValues: PropTypes.object,
  points: PropTypes.shape({
    payload_schema: PropTypes.object,
    points: PropTypes.arrayOf(PropTypes.shape({ payload: PropTypes.object })),
  }),
};

export default PointsFilter;
