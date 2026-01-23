import React, { useMemo, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Box, Grid } from '@mui/material';

import SimilarSearchField from './SimilarSearchField';
import PayloadFilterField from './PayloadFilterField';

const PointsFilter = ({ onConditionChange, conditions = [], payloadSchema = {}, payloadValues = {}, points }) => {
  const [isSimilarExpanded, setIsSimilarExpanded] = useState(false);

  const similarConditions = useMemo(() => conditions.filter((condition) => condition.type === 'id'), [conditions]);

  const payloadConditions = useMemo(() => conditions.filter((condition) => condition.type === 'payload'), [conditions]);

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
            similarConditions={similarConditions}
            payloadConditions={payloadConditions}
            onConditionChange={onConditionChange}
            isExpanded={isSimilarExpanded}
            onExpandChange={handleExpandChange}
          />
        </Grid>

        {/* Payload filter field (with syntax highlighting) */}
        <Grid size={{ xs: 12, md: isSimilarExpanded ? 12 : 9 }}>
          <PayloadFilterField
            payloadConditions={payloadConditions}
            similarConditions={similarConditions}
            payloadSchema={payloadSchema}
            payloadKeyOptions={payloadKeyOptions}
            payloadValues={payloadValues}
            onConditionChange={onConditionChange}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

PointsFilter.propTypes = {
  conditions: PropTypes.array,
  payloadSchema: PropTypes.object,
  payloadValues: PropTypes.object,
  points: PropTypes.shape({
    payload_schema: PropTypes.object,
    points: PropTypes.arrayOf(PropTypes.shape({ payload: PropTypes.object })),
  }),
  onConditionChange: PropTypes.func.isRequired,
};

export default PointsFilter;
