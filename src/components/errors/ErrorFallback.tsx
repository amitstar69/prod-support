
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => {
  return (
    <div className="p-6 rounded-lg border border-red-200 bg-red-50 flex flex-col items-center text-center">
      <AlertCircle className="h-10 w-10 text-red-500 mb-3" />
      <h2 className="text-lg font-medium mb-2">Something went wrong</h2>
      <p className="text-sm text-gray-600 mb-4">
        {error.message || 'An unexpected error occurred'}
      </p>
      <Button onClick={resetErrorBoundary} size="sm">
        Try again
      </Button>
    </div>
  );
};

export default ErrorFallback;
