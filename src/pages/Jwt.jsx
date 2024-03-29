import React, { useState, useEffect } from 'react';
import { Typography, Grid, TextField, Select, MenuItem, Switch, Chip, ListItemText, Checkbox } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import { CenteredFrame } from '../components/Common/CenteredFrame';
import ErrorNotifier from '../components/ToastNotifications/ErrorNotifier';
import { useClient } from '../context/client-context';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import * as jose from 'jose';
import { CopyButton } from '../components/Common/CopyButton';
import { Box } from '@mui/system';

function Jwt() {
  const { client: qdrantClient } = useClient();
  const [errorMessage, setErrorMessage] = useState(null);
  const [writeable, setWriteable] = useState(false);
  const [expiration, setExpiration] = useState(0);
  const [token, setToken] = useState('');
  const [collections, setCollections] = useState([]);
  const [selectedCollections, setSelectedCollections] = useState([]);

  const [showToken, setShowToken] = React.useState(false);
  const handleClickShowApiKey = () => setShowToken((show) => !show);

  useEffect(() => {
    const token = {};
    if (writeable) token.w = true;
    if (expiration) token.exp = expiration;
    if (selectedCollections.length) token.collections = selectedCollections;

    const apiKey = qdrantClient.getApiKey();
    if (!apiKey) {
      setToken('');
      setErrorMessage('Set API key first');
      return;
    }
    const jwt = new jose.SignJWT(token).setProtectedHeader({ alg: 'HS256' }).sign(new TextEncoder().encode(apiKey));
    jwt.then((token) => setToken(token));
  }, [writeable, expiration, selectedCollections]);

  useEffect(() => {
    qdrantClient.getCollections().then((collections) => {
      setCollections(collections.collections.map((collection) => collection.name));
    });
  }, []);

  return (
    <CenteredFrame>
      {errorMessage !== null && <ErrorNotifier message={errorMessage} />}
      <Grid container maxWidth={'xl'} spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h4">Issue new JSON Web Token</Typography>
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Resulting token"
            type={showToken ? 'text' : 'password'}
            style={{ height: '100%' }}
            variant="outlined"
            value={token}
            disabled
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowApiKey}
                    onMouseDown={(event) => event.preventDefault()}
                  >
                    {showToken ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                  <CopyButton
                    text={token}
                    tooltip={'Copy JWT to clipboard'}
                    successMessage={'JWT copied to clipboard'}
                  />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        <Grid item xs={6}>
          <Typography variant="h5">Allow write operations :</Typography>
        </Grid>

        <Grid item xs={6}>
          <Switch checked={writeable} onChange={(e) => setWriteable(e.target.checked)} />
        </Grid>

        <Grid item xs={6}>
          <Typography variant="h5">Expiration :</Typography>
        </Grid>
        <Grid item xs={6}>
          <Select id="expiration" value={expiration} onChange={(e) => setExpiration(e.target.value)} fullWidth>
            <MenuItem value={1}>1 day</MenuItem>
            <MenuItem value={7}>7 days</MenuItem>
            <MenuItem value={30}>30 days</MenuItem>
            <MenuItem value={90}>90 days</MenuItem>
            <MenuItem value={0}>Never</MenuItem>
          </Select>
        </Grid>

        {collectionSelector(collections, selectedCollections, setSelectedCollections)}
      </Grid>
    </CenteredFrame>
  );
}

function collectionSelector(collections, selectedCollections, setSelectedCollections) {
  return (
    <>
      <Grid item xs={6}>
        <Typography variant="h5">Collections :</Typography>
      </Grid>
      <Grid item xs={6}>
        <Select
          multiple
          value={selectedCollections}
          onChange={(e) => setSelectedCollections(e.target.value)}
          fullWidth
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((value) => (
                <Chip key={value} label={value} />
              ))}
            </Box>
          )}
        >
          {collections.map((collection) => (
            <MenuItem key={collection} value={collection}>
              <Checkbox checked={selectedCollections.indexOf(collection) > -1} />
              <ListItemText primary={collection} />
            </MenuItem>
          ))}
        </Select>
      </Grid>
    </>
  );
}

export default Jwt;
