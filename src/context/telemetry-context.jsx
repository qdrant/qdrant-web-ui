import React, { createContext, useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useClient } from './client-context';

const TelemetryContext = createContext();

export function TelemetryProvider({ children }) {
  const [version, setVersion] = useState(null);
  const [maxCollections, setMaxCollections] = useState(null);
  const [jwtEnabled, setJwtEnabled] = useState(false);
  const [jwtVisible, setJwtVisible] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [reshardingEnabled, setReshardingEnabled] = useState(false);
  const { client: qdrantClient } = useClient();

  useEffect(() => {
    async function getTelemetry() {
      try {
        const telemetry = await qdrantClient.api('service').telemetry();
        setVersion(telemetry.data.result.app.version);
        setJwtEnabled(telemetry.data.result.app?.jwt_rbac || false);
        setMaxCollections(telemetry.data.result.collections?.max_collections);
        setReshardingEnabled(telemetry.data.result.cluster?.resharding_enabled || false);

        if (telemetry.data.result.app?.hide_jwt_dashboard) {
          setJwtVisible(false);
        }
        setAuthError(null);
      } catch (error) {
        if (error.status === 403 || error.status === 401) {
          setAuthError(error);
        } else {
          console.log('error fetching telemetry', error);
        }
      }
    }

    getTelemetry();
  }, [qdrantClient]);

  return (
    <TelemetryContext.Provider
      value={{
        version,
        maxCollections,
        setMaxCollections,
        jwtEnabled,
        jwtVisible,
        authError,
        clearAuthError: () => setAuthError(null),
        reshardingEnabled,
      }}
    >
      {children}
    </TelemetryContext.Provider>
  );
}

TelemetryProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useVersion() {
  const context = useContext(TelemetryContext);
  if (context === undefined) {
    throw new Error('useVersion must be used within a TelemetryProvider');
  }
  return { version: context.version };
}

export function useMaxCollections() {
  const context = useContext(TelemetryContext);
  if (context === undefined) {
    throw new Error('useMaxCollections must be used within a TelemetryProvider');
  }
  return { maxCollections: context.maxCollections, setMaxCollections: context.setMaxCollections };
}

export function useJwt() {
  const context = useContext(TelemetryContext);
  if (context === undefined) {
    throw new Error('useJwt must be used within a TelemetryProvider');
  }
  return { jwtEnabled: context.jwtEnabled, jwtVisible: context.jwtVisible };
}

export function useAuthError() {
  const context = useContext(TelemetryContext);
  if (context === undefined) {
    throw new Error('useAuthError must be used within a TelemetryProvider');
  }
  return { authError: context.authError, clearAuthError: context.clearAuthError };
}

export function useTelemetry() {
  const context = useContext(TelemetryContext);
  if (context === undefined) {
    throw new Error('useTelemetry must be used within a TelemetryProvider');
  }
  return context;
}
