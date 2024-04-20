import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
  Tooltip,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useClient } from '../../context/client-context';
import { Check, Delete } from '@mui/icons-material';
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
  const [selectedCollection, setSelectedCollection] = useState('');
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
    <>
      {/* <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}> */}
      <Tooltip
        title="Configures validation of the token based on record stored in the collection"
        placement="right"
      >
        <FormControlLabel
          control={<Switch checked={isTokenValidator} onChange={handleToggle} />}
          label="Token Validator"
        />
      </Tooltip>
      {/* </Box> */}
      <Dialog fullWidth open={open} onClose={handleClose}>
        <DialogTitle>Token Validator</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', gap: 2, mb: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel id="collection-select-label">Collection</InputLabel>
              <Select
                id="collection-select"
                labelId="collection-select-label"
                label="Collection"
                value={selectedCollection?.name || ''}
                onChange={(e) => {
                  setSelectedCollection(collections.find((collection) => collection.name === e.target.value));
                }}
              >
                <MenuItem value="" key="">
                  Not Selected
                </MenuItem>
                {collections.map((collection) => (
                  <MenuItem key={collection.name} value={collection.name}>
                    {collection.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" color={selectedCollection.name ? 'textPrimary' : 'textSecondary'}>
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
                  <Delete />
                </IconButton>
              </Box>
            );
          })}
          <Box sx={{ display: 'flex', gap: 2, '& > :not(:last-of-type)': { width: '40%' } }}>
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
              <Check />
            </IconButton>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={() => {
              configureTokenValidator({
                validationCollection: selectedCollection.name,
                matches,
                setTokenValidatior,
              });
              setOpen(false);
            }}
            disabled={!selectedCollection.name || Object.keys(matches).length === 0}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

TokenValidatior.propTypes = {
  setTokenValidatior: PropTypes.func.isRequired,
};

export default TokenValidatior;
