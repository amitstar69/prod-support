
import React from 'react';
import ErrorBoundary from './ErrorBoundary';
import ErrorFallback from './ErrorFallback';

interface WithErrorHandlingProps {
  component: React.ComponentType<any>;
  fallback?: React.ReactNode;
  [key: string]: any;
}

// Higher-order component to wrap components with error boundaries
const withErrorHandling = <P extends object>(
  Component: React.ComponentType<P>,
  customFallback?: React.ReactNode
): React.FC<P> => {
  const WrappedComponent: React.FC<P> = (props) => {
    return (
      <ErrorBoundary fallback={customFallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
  
  // Set display name for better debugging
  const displayName = Component.displayName || Component.name || 'Component';
  WrappedComponent.displayName = `withErrorHandling(${displayName})`;
  
  return WrappedComponent;
};

export default withErrorHandling;
