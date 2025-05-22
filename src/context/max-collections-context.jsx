import React, { createContext, useState, useContext } from 'react';
import PropTypes from 'prop-types';

const MaxCollectionsContext = createContext();

export function MaxCollectionsProvider({ children }) {
  const [maxCollections, setMaxCollections] = useState(null);

  return (
    <MaxCollectionsContext.Provider value={{ maxCollections, setMaxCollections }}>
      {children}
    </MaxCollectionsContext.Provider>
  );
}

MaxCollectionsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useMaxCollections() {
  const context = useContext(MaxCollectionsContext);
  if (context === undefined) {
    throw new Error('useMaxCollections must be used within a MaxCollectionsProvider');
  }
  return context;
}
