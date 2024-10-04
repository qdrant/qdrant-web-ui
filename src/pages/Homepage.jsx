import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LinearProgress from '@mui/material/LinearProgress';
import { useClient } from '../context/client-context';

const Homepage = () => {
  const { client } = useClient();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    client
      .getCollections()
      .then((data) => {
        setLoading(false);
        if (data.collections.length > 0) {
          navigate('/collections');
        } else {
          navigate('/welcome');
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }, [client]);

  return <>{loading ? <LinearProgress /> : null}</>;
};

export default Homepage;
