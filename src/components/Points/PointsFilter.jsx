import React from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import { Grid, TextField } from '@mui/material';
import { Route, Filter } from 'lucide-react';

const PointsFilter = ({points}) => {
  // todo: implement PointsFilter component
  // - [ ] Add two inputs for Similarity Search and Payload Filter
  //   - [ ] icons
  //   - [ ] styles
  // - [ ] Implement Similarity Search filter logic
  //   - [ ] steps? check how it worked in old version
  // - [ ] Implement Payload Filter logic
  //   - [ ] steps? check how it worked in old version

  const theme = useTheme();
  console.log(points);

  return (
    <Grid container spacing={1}>
      <Grid size={{ xs: 12, md: 3 }}>
        {/* Similarity Search Input */}
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Similar to"
          size="small"
          slotProps={{
            input: {
              startAdornment: <Route size={16} color={theme.palette.text.secondary} style={{ marginRight: 8 }} />,
            },
          }}
          onChange={(e) => {
            console.log(e.target.value);
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 9 }}>
        {/* Payload Filter Input */}
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Filter by"
          size="small"
          // add start icon
          slotProps={{
            input: {
              startAdornment: <Filter size={16} color={theme.palette.text.secondary} style={{ marginRight: 8 }} />,
            },
          }}
          onChange={(e) => {
            console.log(e.target.value);
          }}
        />
      </Grid>
    </Grid>
  );
}

PointsFilter.propTypes = {
  points: PropTypes.object.isRequired,
};

export default PointsFilter;
