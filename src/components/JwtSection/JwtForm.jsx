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
  FormControlLabel,
  CardHeader,
} from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import { CancelOutlined } from '@mui/icons-material';

import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import CollectionAccessDialog from './CollectionAccessDialog';
import configureCollection from './RbacCollectionSettings';
import TokenValidatior from './TokenValidatior';

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

  const [settingsDialogOpen, setSettingsDialogOpen] = React.useState(false);

  return (
    <Card sx={{ flexGrow: 1 }} variant="dual">
      <CardHeader
        title="Collections"
        action={
          <IconButton disabled={globalAccess} onClick={() => setSettingsDialogOpen(true)}>
            <AddIcon />
          </IconButton>
        }
      />

      <CollectionAccessDialog
        show={settingsDialogOpen}
        setShow={setSettingsDialogOpen}
        onSave={({ isAccessible, isWritable, payloadFilters, selectedCollection }) => {
          configureCollection({
            collectionName: selectedCollection,
            isAccessible,
            isWritable,
            payloadFilters,
            configuredCollections: collections,
            setConfiguredCollections: setCollections,
          });
        }}
      />

      <CardContent>
        <Box>
          {globalAccess && (
            <Typography component={'p'} variant={'body2'} mb={2}>
              Global access is enabled. All collections will be accessible.
            </Typography>
          )}
          {!globalAccess && collections.length == 0 && (
            <Typography component={'p'} variant={'body2'} mb={2}>
              No collections access configured.
            </Typography>
          )}
          {!globalAccess && collections && (
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
          )}
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
  expiration,
  setExpiration,
  globalAccess,
  setGlobalAccess,
  manageAccess,
  setManageAccess,
  collections,
  setCollections,
  setTokenValidatior,
  sx,
}) {
  return (
    <Box sx={{ ...sx }}>
      <Box display={'flex'} gap={2} mb={3}>
        <Card sx={{ minWidth: '270px', width: '35%' }} variant="dual">
          <CardContent>
            <Box ml={1}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Tooltip title="Allows read access to all collections in the cluster." placement="right">
                  <FormControlLabel
                    control={<Switch checked={globalAccess} onChange={(e) => setGlobalAccess(e.target.checked)} />}
                    label="Allow global access"
                  />
                </Tooltip>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Tooltip
                  title="Allows full access to the cluster, including
                    writing and deleting data,
                    creating and deleting collections, changing topology, etc."
                  placement="right"
                >
                  <FormControlLabel
                    disabled={!globalAccess}
                    control={<Switch checked={manageAccess} onChange={(e) => setManageAccess(e.target.checked)} />}
                    label="Allow mange operations"
                  />
                </Tooltip>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <TokenValidatior setTokenValidatior={setTokenValidatior} />
              </Box>
            </Box>

            {/* Select */}
            <ExpirationSelect expiration={expiration} setExpiration={setExpiration} />
          </CardContent>
        </Card>
        <Collections globalAccess={globalAccess} collections={collections} setCollections={setCollections} />
      </Box>
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
  setCollections: PropTypes.func.isRequired,
  setTokenValidatior: PropTypes.func.isRequired,
  sx: PropTypes.object,
};

export default JwtForm;
