import React, { useCallback } from 'react';
import { Navigate, useNavigate } from 'react-router';
import CreateCollectionDialog from '../components/Collections/CreateCollection/CreateCollectionDialog';
import { useClient } from '../context/client-context';

function CollectionCreation() {
  const navigate = useNavigate();
  const { isRestricted } = useClient();

  const handleClose = useCallback(() => {
    navigate('/collections');
  }, [navigate]);

  if (isRestricted) {
    return <Navigate to="/collections" replace />;
  }

  return <CreateCollectionDialog open={true} handleClose={handleClose} />;
}

export default CollectionCreation;
