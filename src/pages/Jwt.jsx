/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
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

function generateToken(globalAccess, writable, expirationDays, configuredCollections) {
  const token = {};
  if (globalAccess) {
    if (writable) {
      token.access = 'rw';
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

  return token;
}

function Jwt() {
  const headerHeight = 64;
  const { client: qdrantClient } = useClient();
  const [errorMessage, setErrorMessage] = useState(null);

  const [globalAccess, setGlobalAccess] = useState(true);

  const [writable, setWritable] = useState(false);
  const [expirationDays, setExpirationDays] = useState(0);

  const [collections, setCollections] = useState([]);
  const [configuredCollections, setConfiguredCollections] = useState([]);

  const [jwt, setJwt] = useState('');

  const token = generateToken(globalAccess, writable, expirationDays, configuredCollections);

  const apiKey = qdrantClient.getApiKey();

  if (!apiKey) {
    setErrorMessage('Set API key first');
  }

  useEffect(() => {
    getJwt(apiKey, token, setJwt);
  }, [token, apiKey]);

  useEffect(() => {
    qdrantClient.getCollections().then((collections) => {
      setCollections(collections.collections.map((collection) => collection.name));
    });
  }, []);

  return (
    <Box
      sx={{
        display: 'flex',
        alignContent: 'stretch',
        height: `calc(100vh - ${headerHeight}px)`,
        overflowY: 'scroll',
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
          mx: 'auto',
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
          writable={writable}
          setWritable={setWritable}
          collections={configuredCollections}
          setCollections={setConfiguredCollections}
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
