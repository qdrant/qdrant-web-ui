import React from 'react';
import PropTypes from 'prop-types';
import { Box, Button, OutlinedInput, MenuItem, TextField, Typography, InputLabel } from '@mui/material';
import TokenValidatior from './TokenValidatior';
import JwtPerCollection from './JwtPerCollection';
import StyledButtonGroup from '../Common/StyledButtonGroup';

const ExpirationSelect = ({ expiration, setExpiration }) => {
  const handleChange = (event) => {
    setExpiration(event.target.value);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }} role="group">
      <InputLabel
        htmlFor="expiration-select"
        sx={{
          color: 'text.primary',
          fontWeight: 500,
        }}
      >
        Expiration
      </InputLabel>
      <TextField
        select
        fullWidth
        id="expiration-select"
        value={expiration}
        onChange={handleChange}
        slots={{
          input: OutlinedInput,
        }}
        sx={{
          '& .MuiSelect-outlined': {
            py: 1.5,
          },
        }}
      >
        <MenuItem value={1}>1 day</MenuItem>
        <MenuItem value={7}>7 days</MenuItem>
        <MenuItem value={30}>30 days</MenuItem>
        <MenuItem value={90}>90 days</MenuItem>
        <MenuItem value={0}>Never</MenuItem>
      </TextField>
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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }} role="form">
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, py: 1 }}>
        <StyledButtonGroup fullWidth variant="outlined" aria-label="Access Level">
          <Button
            variant={!globalAccess && !manageAccess ? 'contained' : 'outlined'}
            onClick={() => {
              setManageAccess(false);
              setGlobalAccess(false);
            }}
          >
            Collection Access
          </Button>
          <Button
            variant={globalAccess && !manageAccess ? 'contained' : 'outlined'}
            onClick={() => {
              setManageAccess(false);
              setGlobalAccess(true);
              setConfiguredCollections([]); // Reset collections if global or managed access is selected
            }}
          >
            Global Access
          </Button>
          <Button
            variant={manageAccess ? 'contained' : 'outlined'}
            onClick={() => {
              setManageAccess(true);
              setGlobalAccess(true);
              setConfiguredCollections([]); // Reset collections if global or managed access is selected
            }}
          >
            Managed Access
          </Button>
        </StyledButtonGroup>

        {/* Description of the access level, displayed depending on the button selection*/}
        {manageAccess && (
          <Typography variant="body2" color="text.secondary">
            <strong>Managed Access:</strong> Full access to all data stored in Qdrant. This level of access allows you
            to read and write data to all collections, as well as create and delete collections, modify collection
            settings, etc.
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
      </Box>

      {collections.length > 0 && (
        <JwtPerCollection
          globalAccess={globalAccess}
          collections={collections}
          setConfiguredCollections={setConfiguredCollections}
          manageAccess={manageAccess}
        />
      )}

      <TokenValidatior setTokenValidatior={setTokenValidatior} />

      <ExpirationSelect expiration={expiration} setExpiration={setExpiration} />
    </Box>
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
