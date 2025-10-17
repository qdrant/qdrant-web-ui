import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  // InputLabel,
  MenuItem,
  Switch,
  TextField,
  Typography,
  Tooltip,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useClient } from '../../context/client-context';
import { Plus, Minus } from 'lucide-react';
import PropTypes from 'prop-types';

function configureTokenValidator({ validationCollection, matches, setTokenValidatior }) {
  const valueExists = {
    collection: validationCollection,
    matches: Object.keys(matches).map((myKey) => ({
      key: myKey,
      value: matches[myKey],
    })),
  };
  setTokenValidatior(valueExists);
}

const TokenValidatior = ({ setTokenValidatior }) => {
  const [open, setOpen] = useState(false);
  const [isTokenValidator, setIsTokenValidator] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [collections, setCollections] = useState([]);
  const handleClose = () => {
    setOpen(false);
    setIsTokenValidator(false);
  };
  const [matches, setMatches] = useState({});
  const { client: qdrantClient } = useClient();
  const [newMatchesKey, setNewMatchesKey] = useState('');
  const [newMatchesValue, setNewMatchesValue] = useState('');
  const handleToggle = () => {
    if (isTokenValidator) {
      setOpen(false);
      setTokenValidatior({});
      setIsTokenValidator(false);
    } else {
      setOpen(true);
      setIsTokenValidator(true);
    }
  };
  useEffect(() => {
    const fetchCollections = async () => {
      setCollections((await qdrantClient.getCollections()).collections);
    };
    fetchCollections();
  }, [open]);

  return (
    <Box>
      <Tooltip title="Configures validation of the token based on record stored in the collection" placement="right">
        <FormControlLabel
          control={<Switch checked={isTokenValidator} onChange={handleToggle} />}
          label="Token Validator"
          sx={{ gap: 0.75 }}
        />
      </Tooltip>
      <Dialog fullWidth open={open} onClose={handleClose}>
        <DialogTitle>Token Validator</DialogTitle>
        <DialogContent component="form" role="form">
          <Box sx={{ display: 'flex', gap: 2, mb: 2, mt: 1 }}>
            <Box sx={{ display: 'flex', width: '100%', flexDirection: 'column', gap: 1.5 }} role="group">
              <TextField
                select
                fullWidth
                id="collection-select"
                value={selectedCollection?.name || ''}
                onChange={(e) => {
                  setSelectedCollection(
                    e.target.value ? collections.find((collection) => collection.name === e.target.value) : null
                  );
                }}
                slotProps={{
                  select: {
                    displayEmpty: true,
                    renderValue: (selected) => {
                      if (!selected) {
                        return <Box sx={{ color: 'text.secondary' }}>Select Collection</Box>;
                      }
                      return selected;
                    },
                  },
                }}
              >
                {collections.map((collection) => (
                  <MenuItem key={collection.name} value={collection.name}>
                    {collection.name}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          </Box>

          <Box sx={{ mt: 4, mb: 2 }}>
            <Typography variant="h6" color={selectedCollection?.name ? 'textPrimary' : 'textSecondary'}>
              Set Matches
            </Typography>
          </Box>
          {Object.keys(matches).map((key) => {
            return (
              <Box sx={{ display: 'flex', gap: 2, mb: 2, '& > :not(:last-of-type)': { width: '40%' } }} key={key}>
                <TextField disabled label="Key" value={key} />
                <TextField disabled label="Value" value={matches[key]} />
                <IconButton
                  aria-label="delete"
                  size="large"
                  onClick={() => {
                    const newMatches = { ...matches };
                    delete newMatches[key];
                    setMatches(newMatches);
                  }}
                >
                  <Minus />
                </IconButton>
              </Box>
            );
          })}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label="Key" value={newMatchesKey} onChange={(e) => setNewMatchesKey(e.target.value)} />

            <TextField label="Value" value={newMatchesValue} onChange={(e) => setNewMatchesValue(e.target.value)} />
            <IconButton
              aria-label="delete"
              size="large"
              onClick={() => {
                setMatches((prev) => ({
                  ...prev,
                  [newMatchesKey]: newMatchesValue,
                }));
                setNewMatchesKey('');
                setNewMatchesValue('');
              }}
              disabled={!newMatchesKey || !newMatchesValue}
            >
              <Plus />
            </IconButton>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button variant="outlined" color="inherit" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              configureTokenValidator({
                validationCollection: selectedCollection?.name,
                matches,
                setTokenValidatior,
              });
              setOpen(false);
            }}
            disabled={!selectedCollection?.name || Object.keys(matches).length === 0}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

TokenValidatior.propTypes = {
  setTokenValidatior: PropTypes.func.isRequired,
};

export default TokenValidatior;
