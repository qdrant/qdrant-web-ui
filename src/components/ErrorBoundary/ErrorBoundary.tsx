import { Button } from "@mui/material";
import { useEffect, useRef } from "react";
import { ErrorBoundary as ErrorBoundaryComponent } from "react-error-boundary";
import { useLocation } from "react-router-dom";

export const ErrorFallback = ({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) => {
  const { pathname } = useLocation();

  const errorLocation = useRef(location.pathname);
  useEffect(() => {
    if (location.pathname !== errorLocation.current) {
      resetErrorBoundary();
    }
  }, [pathname]);

  return (
    <div role="alert">
      <p>
        Something went wrong <code>{pathname}</code>:
      </p>
      <pre>{error.message}</pre>
      <Button onClick={resetErrorBoundary}>Try again</Button>
    </div>
  );
};

export const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  return (
    <ErrorBoundaryComponent
      fallbackRender={({ error, resetErrorBoundary }) => (
        <ErrorFallback error={error} resetErrorBoundary={resetErrorBoundary} />
      )}
      onReset={() => {
        // reset the state of your app so the error doesn't happen again
      }}
    >
      {children}
    </ErrorBoundaryComponent>
  );
};
