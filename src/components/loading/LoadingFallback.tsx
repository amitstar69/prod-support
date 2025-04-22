
import React, { useState, useEffect } from 'react';

export const LoadingFallback = () => {
  const [showTimeout, setShowTimeout] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTimeout(true);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center p-4">
      <div className="animate-spin h-12 w-12 rounded-full border-t-2 border-b-2 border-primary"></div>
      <p className="mt-4 text-lg">Loading...</p>
      {showTimeout && (
        <p className="mt-2 text-amber-600">
          This is taking longer than expected. Please wait or try refreshing.
        </p>
      )}
    </div>
  );
};
