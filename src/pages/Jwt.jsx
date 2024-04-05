/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import ErrorNotifier from '../components/ToastNotifications/ErrorNotifier';
import { useClient } from '../context/client-context';
import JwtForm from '../components/JwtSection/JwtForm';
import JwtResultForm from '../components/JwtSection/JwtResultForm';
import * as jose from 'jose';

function Jwt() {
  const headerHeight = 64;
  const { client: qdrantClient } = useClient();
  const [errorMessage, setErrorMessage] = useState(null);
  const [writable, setWritable] = useState(false);
  const [expiration, setExpiration] = useState(0);
  const [token, setToken] = useState('');
  const [collections, setCollections] = useState([]);
  const [selectedCollections, setSelectedCollections] = useState('');
  const [settings, setSettings] = React.useState({});

  useEffect(() => {
    const token = {};
    if (writable) token.w = true;
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
  }, [writable, expiration, selectedCollections]);

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
      <JwtForm
        token={token}
        expiration={expiration}
        setExpiration={setExpiration}
        writable={writable}
        setWritable={setWritable}
        collections={collections}
        setCollections={setCollections}
        sx={{
          px: 2,
          pt: 4,
          pb: 20,
          width: '50%',
          overflowY: 'scroll',
          maxWidth: '1200px',
          mx: 'auto',
        }}
      />
      {collections.length > 0 && (
        <JwtResultForm
          collections={collections}
          selectedCollections={selectedCollections}
          setSelectedCollections={setSelectedCollections}
          settings={settings}
          setSettings={setSettings}
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
