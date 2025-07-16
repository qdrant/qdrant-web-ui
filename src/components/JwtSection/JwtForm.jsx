import React from 'react';
import PropTypes from 'prop-types';
import { Box, Card, CardContent, FormControl, InputLabel, MenuItem, Select, Typography } from '@mui/material';
import TokenValidatior from './TokenValidatior';
import JwtPerCollection from './JwtPerCollection';
import StyledSlider from '../Common/StyledSlider';

const ExpirationSelect = ({ expiration, setExpiration }) => {
  const handleChange = (event) => {
    setExpiration(event.target.value);
  };

  return (
    <Box>
      <FormControl fullWidth>
        <InputLabel id="expiration-label">Expiration</InputLabel>
        <Select
          id="expiration-select"
          labelId="expiration-label"
          value={expiration}
          label="Expiration"
          onChange={handleChange}
          variant="outlined"
        >
          <MenuItem value={1}>1 day</MenuItem>
          <MenuItem value={7}>7 days</MenuItem>
          <MenuItem value={30}>30 days</MenuItem>
          <MenuItem value={90}>90 days</MenuItem>
          <MenuItem value={0}>Never</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};

ExpirationSelect.propTypes = {
  expiration: PropTypes.number.isRequired,
  setExpiration: PropTypes.func.isRequired,
};

function JwtForm({
  expiration,
  setExpiration,
  globalAccess,
  setGlobalAccess,
  manageAccess,
  setManageAccess,
  collections,
  setConfiguredCollections,
  setTokenValidatior,
}) {
  return (
    <>
      <Box>
        <StyledSlider
          aria-label="Access Level"
          value={manageAccess ? 100 : globalAccess ? 50 : 0}
          onChange={(e, newValue) => {
            setManageAccess(newValue === 100);
            setGlobalAccess(newValue >= 50);
            if (newValue !== 0) {
              setConfiguredCollections([]); // Reset collections if global or managed access is selected
            }
          }}
          valueLabelDisplay="off"
          step={50}
          marks={[
            { value: 0, label: 'Collection Access' },
            { value: 50, label: 'Global Access' },
            { value: 100, label: 'Managed Access' },
          ]}
          min={0}
          max={100}
        />

        {/* Description of the access level, displayed depending on the slider value*/}
        <Card variant="dual" sx={{ my: 4 }}>
          <CardContent sx={{ '&:last-child': { pb: 2 } }}>
            {manageAccess && (
              <Typography variant="body2" color="text.secondary">
                <strong>Managed Access:</strong> Full access to all data stored in Qdrant. This level of access allows
                you to read and write data to all collections, as well as create and delete collections, modify
                collection settings, etc.
              </Typography>
            )}
            {globalAccess && !manageAccess && (
              <Typography variant="body2" color="text.secondary">
                <strong>Global Access:</strong> Allows read-only access to all data stored in Qdrant.
              </Typography>
            )}
            {!globalAccess && !manageAccess && (
              <Typography variant="body2" color="text.secondary">
                <strong>Collection Access:</strong>
                This access level allows to configure access level for specific collections.
              </Typography>
            )}
          </CardContent>
        </Card>
      </Box>

      {collections.length > 0 && (
        <JwtPerCollection
          globalAccess={globalAccess}
          collections={collections}
          setConfiguredCollections={setConfiguredCollections}
          manageAccess={manageAccess}
        />
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <TokenValidatior setTokenValidatior={setTokenValidatior} />
      </Box>

      {/* Select */}
      <ExpirationSelect expiration={expiration} setExpiration={setExpiration} />
    </>
  );
}

JwtForm.propTypes = {
  expiration: PropTypes.number.isRequired,
  setExpiration: PropTypes.func.isRequired,
  globalAccess: PropTypes.bool.isRequired,
  setGlobalAccess: PropTypes.func.isRequired,
  manageAccess: PropTypes.bool.isRequired,
  setManageAccess: PropTypes.func.isRequired,
  collections: PropTypes.array.isRequired,
  setConfiguredCollections: PropTypes.func.isRequired,
  setTokenValidatior: PropTypes.func.isRequired,
};

export default JwtForm;
