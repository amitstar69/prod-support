
import React, { useState, useEffect } from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/button';

interface LoadingStateProps {
  message?: string;
  description?: string;
  timeout?: number;
}

const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = "Loading help requests...",
  description = "We're retrieving all available help requests from the database.",
  timeout = 10000 // 10 seconds before showing warning
}) => {
  const [isLongLoad, setIsLongLoad] = useState(false);
  const [loadTime, setLoadTime] = useState(0);
  
  useEffect(() => {
    const startTime = Date.now();
    
    // Update load time every second
    const interval = setInterval(() => {
      const currentLoadTime = Math.floor((Date.now() - startTime) / 1000);
      setLoadTime(currentLoadTime);
      
      if (currentLoadTime * 1000 >= timeout && !isLongLoad) {
        setIsLongLoad(true);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [timeout, isLongLoad]);
  
  // Function to force refresh the page
  const handleForceRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="flex flex-col justify-center items-center py-12 space-y-4">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <span className="text-lg text-muted-foreground">{message}</span>
      <p className="text-sm text-center text-muted-foreground max-w-md">
        {description}
      </p>
      
      {isLongLoad && (
        <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md border border-yellow-200 dark:border-yellow-800/30 max-w-md">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-1" />
            <div>
              <p className="font-medium text-yellow-800 dark:text-yellow-300">
                This is taking longer than expected ({loadTime}s)
              </p>
              <p className="text-sm mt-1 text-yellow-700 dark:text-yellow-400">
                There might be a connection issue or the server is experiencing high traffic.
              </p>
              <Button 
                variant="outline" 
                onClick={handleForceRefresh} 
                className="mt-3 border-yellow-300 dark:border-yellow-800 hover:bg-yellow-100 dark:hover:bg-yellow-900/30"
              >
                Refresh Page
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoadingState;
