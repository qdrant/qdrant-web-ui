/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { alpha, Box } from '@mui/material';
import ErrorNotifier from '../components/ToastNotifications/ErrorNotifier';
import { useClient } from '../context/client-context';
import JwtForm from '../components/JwtSection/JwtForm';
import JwtResultForm from '../components/JwtSection/JwtResultForm';
import * as jose from 'jose';

function Jwt() {
  const { client: qdrantClient } = useClient();
  const [errorMessage, setErrorMessage] = useState(null);
  const [writable, setWritable] = useState(false);
  const [expiration, setExpiration] = useState(0);
  const [token, setToken] = useState('');
  const [collections, setCollections] = useState([]);
  const [selectedCollections, setSelectedCollections] = useState([]);

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
    <Box sx={{ display: 'flex', height: '100%' }}>
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
        <JwtForm
          token={token}
          expiration={expiration}
          setExpiration={setExpiration}
          writable={writable}
          setWritable={setWritable}
          collections={collections}
          setCollections={setCollections}
        />
      </Box>
      <Box
        sx={{
          overflowY: 'scroll',
          width: '50%',
        }}
      >
        <JwtResultForm />
      </Box>
    </Box>
  );
}

// todo: remove eslint-disable

export default Jwt;
