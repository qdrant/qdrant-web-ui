import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Card,
  CardContent,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  Typography,
  FormControlLabel
} from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import { CancelOutlined } from '@mui/icons-material';

const ExpirationSelect = ({ expiration, setExpiration }) => {
  const handleChange = (event) => {
    setExpiration(event.target.value);
  };

  return (
    <Box sx={{ mb: 4 }}>
      <FormControl fullWidth>
        <InputLabel id="demo-simple-select-label">Expiration</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={expiration}
          label="Expiration"
          onChange={handleChange}
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

const Collections = ({ globalAccess, collections, setCollections }) => {
  const handleDelete = (collection) => {
    setCollections((prev) => prev.filter((c) => c !== collection));
  };

  return (
    <Card sx={{ flexGrow: 1 }} variant="dual">
      <CardContent>
        <Box>
          <Typography component={'p'} variant={'h6'} mb={2}>
            Collections:
          </Typography>
          {
            globalAccess && (
              <Typography component={'p'} variant={'body2'} mb={2}>
                Global access is enabled. All collections will be accessible.
              </Typography>
            )
          }
          {
            !globalAccess && collections.length == 0 && (
              <Typography component={'p'} variant={'body2'} mb={2}>
                No collections access configured.
              </Typography>
            )
          }
          {
            !globalAccess && collections && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '18px 12px', mb: 5 }}>
                {collections.map((collection) => (
                  <Chip
                    key={collection.collection}
                    label={collection.collection}
                    deleteIcon={
                      <Tooltip title={'Remove from set'} placement={'right'}>
                        <CancelOutlined fontSize="small" />
                      </Tooltip>
                    }
                    onDelete={() => handleDelete(collection)}
                  />
                ))}
              </Box>
            )
          }

        </Box>
      </CardContent>
    </Card>
  );
};

Collections.propTypes = {
  globalAccess: PropTypes.bool.isRequired,
  collections: PropTypes.array.isRequired,
  setCollections: PropTypes.func.isRequired,
};

function JwtForm({
  expiration, setExpiration,
  globalAccess, setGlobalAccess,
  writable, setWritable,
  collections, setCollections,
  sx
}) {
  return (
    <Box sx={{ ...sx }}>
      <Box display={'flex'} gap={2} mb={3}>
        <Card sx={{ minWidth: '270px', width: '35%' }} variant="dual">
          <CardContent>
            <Box ml={1} >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <FormControlLabel control={
                  <Switch checked={globalAccess} onChange={(e) => setGlobalAccess(e.target.checked)} />
                } label="Allow global access" />
              </Box>


              <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <FormControlLabel disabled={!globalAccess} control={
                  <Switch checked={writable} onChange={(e) => setWritable(e.target.checked)} />
                } label="Allow write operations" />
              </Box>
            </Box>

            {/* Select */}
            <ExpirationSelect expiration={expiration} setExpiration={setExpiration} />
          </CardContent>
        </Card>
        <Collections
          globalAccess={globalAccess}
          collections={collections}
          setCollections={setCollections}
        />
      </Box>
    </Box>
  );
}

JwtForm.propTypes = {
  expiration: PropTypes.number.isRequired,
  setExpiration: PropTypes.func.isRequired,
  globalAccess: PropTypes.bool.isRequired,
  setGlobalAccess: PropTypes.func.isRequired,
  writable: PropTypes.bool.isRequired,
  setWritable: PropTypes.func.isRequired,
  collections: PropTypes.array.isRequired,
  setCollections: PropTypes.func.isRequired,
  sx: PropTypes.object,
};

export default JwtForm;
