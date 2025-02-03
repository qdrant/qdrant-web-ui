/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { Alert, Box, Grid, Typography } from '@mui/material';
import ErrorNotifier from '../components/ToastNotifications/ErrorNotifier';
import { useClient } from '../context/client-context';
import JwtForm from '../components/JwtSection/JwtForm';
import JwtResultForm from '../components/JwtSection/JwtResultForm';
import * as jose from 'jose';
import JwtTokenViewer from '../components/JwtSection/JwtTokenViewer';

async function getJwt(apiKey, token, setJwt) {
  const jwt = await new jose.SignJWT(token).setProtectedHeader({ alg: 'HS256' }).sign(new TextEncoder().encode(apiKey));
  setJwt(jwt);
}

function generateToken(globalAccess, manageAccess, expirationDays, configuredCollections, tokenValidatior) {
  const token = {};
  if (globalAccess) {
    if (manageAccess) {
      token.access = 'm';
    } else {
      token.access = 'r';
    }
  } else {
    token.access = configuredCollections;
  }

  if (expirationDays) {
    const secondsInDay = 24 * 60 * 60;

    token.exp = Math.floor(Date.now() / 1000) + expirationDays * secondsInDay;
  }
  if (tokenValidatior && tokenValidatior.collection && tokenValidatior.matches.length > 0) {
    token.value_exists = tokenValidatior;
  }

  return token;
}

function Jwt() {
  const headerHeight = 64;
  const { client: qdrantClient, isRestricted } = useClient();
  const [errorMessage, setErrorMessage] = useState(null);

  const [globalAccess, setGlobalAccess] = useState(true);

  const [manageAccess, setManageAccess] = useState(false);
  const [expirationDays, setExpirationDays] = useState(0);

  const [collections, setCollections] = useState([]);
  const [configuredCollections, setConfiguredCollections] = useState([]);
  const [tokenValidatior, setTokenValidatior] = useState({});
  const [apiKey, setApiKey] = useState('');

  const [jwt, setJwt] = useState('');

  const token = generateToken(globalAccess, manageAccess, expirationDays, configuredCollections, tokenValidatior);

  useEffect(() => {
    if (apiKey && token) {
      getJwt(apiKey, token, setJwt);
    }
  }, [token, apiKey]);

  useEffect(() => {
    qdrantClient.getCollections().then((collections) => {
      setCollections(collections.collections.map((collection) => collection.name));
    });
    const apiKey = qdrantClient.getApiKey();
    if (!apiKey) {
      setErrorMessage('Please provide API key');
    }
    setApiKey(apiKey);
  }, []);

  if (isRestricted) {
    return (
      <Box sx={{ p: 5, width: '100%' }}>
        <Grid xs={12} item>
          <Alert severity="warning">
            Access Denied: Because of the serverless mode, jwt tools will not work correctly.
            Please contact your administrator.
          </Alert>
        </Grid>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignContent: 'stretch',
        height: `calc(100vh - ${headerHeight}px)`,
        overflowY: 'scroll'
      }}
    >
      {errorMessage && <ErrorNotifier message={errorMessage} />}

      <Box
        sx={{
          px: 2,
          pt: 4,
          pb: 20,
          width: '50%',
          overflowY: 'scroll',
          maxWidth: '1200px',
          mx: 'auto'
        }}
      >
        <Typography variant="h4" gutterBottom>
          Generate new Access Token
        </Typography>

        <JwtForm
          expiration={expirationDays}
          setExpiration={setExpirationDays}
          globalAccess={globalAccess}
          setGlobalAccess={setGlobalAccess}
          manageAccess={manageAccess}
          setManageAccess={setManageAccess}
          collections={configuredCollections}
          setCollections={setConfiguredCollections}
          setTokenValidatior={setTokenValidatior}
        />

        <JwtTokenViewer jwt={jwt} token={token} />
      </Box>


      {collections.length > 0 && (
        <JwtResultForm
          allCollecitons={collections}
          configuredCollections={configuredCollections}
          setConfiguredCollections={setConfiguredCollections}
          jwt={jwt}
          sx={{
            height: `calc(100vh - ${headerHeight}px)`,
            overflowY: 'scroll',
            width: '50%',
          }}
        />
      )}
    </Box>
  );
}

// todo: remove eslint-disable

export default Jwt;
