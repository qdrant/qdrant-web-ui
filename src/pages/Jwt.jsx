import React, { useEffect, useState } from 'react';
import { Alert, Box, Grid, Typography, Link } from '@mui/material';
import ErrorNotifier from '../components/ToastNotifications/ErrorNotifier';
import { useClient } from '../context/client-context';
import JwtForm from '../components/JwtSection/JwtForm';
import * as jose from 'jose';
import { useSnackbar } from 'notistack';
import JwtTokenViewer from '../components/JwtSection/JwtTokenViewer';
import { CenteredFrame } from '../components/Common/CenteredFrame';

async function getJwt(apiKey, token, setJwt) {
  try {
    const jwt = await new jose.SignJWT(token)
      .setProtectedHeader({ alg: 'HS256' })
      .sign(new TextEncoder().encode(apiKey));
    setJwt(jwt);
  } catch (err) {
    console.error('Error generating JWT:', err);
    setJwt('');
  }
}

function generateToken(globalAccess, manageAccess, expirationDays, configuredCollections, tokenValidatior) {
  const token = {};
  if (globalAccess) {
    token.access = manageAccess ? 'm' : 'r';
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
  // const headerHeight = 64;
  const { client: qdrantClient, isRestricted } = useClient();
  const [errorMessage, setErrorMessage] = useState(null);

  const [globalAccess, setGlobalAccess] = useState(true);

  const [manageAccess, setManageAccess] = useState(false);
  const [expirationDays, setExpirationDays] = useState(0);

  const [collections, setCollections] = useState([]);
  const [configuredCollections, setConfiguredCollections] = useState([]);
  const [tokenValidatior, setTokenValidatior] = useState({});
  const [apiKey, setApiKey] = useState('');

  const { enqueueSnackbar } = useSnackbar();

  const [jwt, setJwt] = useState('');

  const canUseWebCrypto = window.isSecureContext;

  const token = generateToken(globalAccess, manageAccess, expirationDays, configuredCollections, tokenValidatior);

  useEffect(() => {
    if (!canUseWebCrypto) {
      enqueueSnackbar('Advanced cryptographic features are not available in this context.', { variant: 'warning' });
      return;
    }
  }, []);

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
        <Grid size={12}>
          <Alert severity="warning">
            Access Denied: Because of the serverless mode, jwt tools will not work correctly. Please contact your
            administrator.
          </Alert>
        </Grid>
      </Box>
    );
  }

  return (
    <CenteredFrame>
      {errorMessage && <ErrorNotifier message={errorMessage} />}

      <Box
        sx={{
          pb: 12,
          width: '100%',
          maxWidth: '900px',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        <Typography variant="h4">Generate Access Token</Typography>

        <JwtForm
          expiration={expirationDays}
          setExpiration={setExpirationDays}
          globalAccess={globalAccess}
          setGlobalAccess={setGlobalAccess}
          manageAccess={manageAccess}
          setManageAccess={setManageAccess}
          collections={collections}
          setConfiguredCollections={setConfiguredCollections}
          setTokenValidatior={setTokenValidatior}
        />

        {canUseWebCrypto === false ? (
          <Alert severity="warning">
            Advanced cryptographic features are not available in this context. Please use a secure context (HTTPS) to
            enable JWT generation. Alternatively, you can generate the JWT token{' '}
            <Link
              href="https://qdrant.tech/documentation/guides/security/#generating-json-web-tokens"
              target="_blank"
              rel="noopener noreferrer"
            >
              externally
            </Link>{' '}
            using your API key and the desired payload.
          </Alert>
        ) : (
          <JwtTokenViewer jwt={jwt} token={token} />
        )}
      </Box>
    </CenteredFrame>
  );
}

export default Jwt;
