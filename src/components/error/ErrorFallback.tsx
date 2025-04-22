
import React from 'react';

export const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center p-4 text-center">
      <h2 className="mb-4 text-2xl font-bold">Something went wrong</h2>
      <p className="mb-4 text-red-500">{error.message || 'An unexpected error occurred'}</p>
      <button
        onClick={resetErrorBoundary}
        className="rounded bg-primary px-4 py-2 text-white hover:bg-primary/90"
      >
        Try again
      </button>
      <button
        onClick={() => window.location.href = '/'}
        className="mt-2 rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
      >
        Go to homepage
      </button>
    </div>
  );
};
