import React, { useState, useEffect } from 'react';
import { Typography, Grid, Checkbox, FormControlLabel, TextField } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { CenteredFrame } from '../components/Common/CenteredFrame';
import ErrorNotifier from '../components/ToastNotifications/ErrorNotifier';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useClient } from '../context/client-context';
import { Visibility, VisibilityOff, ContentPaste } from '@mui/icons-material';
import dayjs from 'dayjs';
import * as jose from 'jose';

function Jwt() {
  const { client: qdrantClient } = useClient();
  const [errorMessage, setErrorMessage] = useState(null);
  const [writeable, setWriteable] = useState(false);
  const [expires, setExpires] = useState(false);
  const [expiration, setExpiration] = useState(dayjs());

  const [token, setToken] = useState('');

  const [showToken, setShowToken] = React.useState(false);
  const handleClickShowApiKey = () => setShowToken((show) => !show);

  async function copyToClipboard() {
    try {
      if (token === '') setErrorMessage('Set API key first');
      await navigator.clipboard.writeText(token);
    } catch (error) {
      setErrorMessage(`Failed to copy token to clipboard: ${error.message}`);
    }
  }

  useEffect(() => {
    const token = {};
    if (writeable) token.w = true;
    if (expires) token.exp = expiration.unix();

    const apiKey = qdrantClient.getApiKey();
    if (!apiKey) {
      setToken('');
      return;
    }
    const jwt = new jose.SignJWT(token).setProtectedHeader({ alg: 'HS256' }).sign(new TextEncoder().encode(apiKey));
    jwt.then((token) => setToken(token));
  }, [writeable, expires, expiration]);

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
            multiline={showToken}
            rows={4}
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
                  <IconButton aria-label="copy to clipboard" onClick={copyToClipboard}>
                    <ContentPaste />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={<Checkbox checked={writeable} onChange={(e) => setWriteable(e.target.checked)} />}
            label="Allow write operations"
          />
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={<Checkbox checked={expires} onChange={(e) => setExpires(e.target.checked)} />}
            label="Expires"
          />
          {expires && (
            <>
              <br />
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateTimePicker
                  value={expiration}
                  onChange={(newValue) => {
                    setExpiration(newValue);
                  }}
                />
              </LocalizationProvider>
            </>
          )}
        </Grid>
      </Grid>
    </CenteredFrame>
  );
}

export default Jwt;
