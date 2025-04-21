
import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  description?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = "Loading help requests...",
  description = "We're retrieving all available help requests from the database."
}) => {
  return (
    <div className="flex flex-col justify-center items-center py-12 space-y-4">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <span className="text-lg text-muted-foreground">{message}</span>
      <p className="text-sm text-center text-muted-foreground max-w-md">
        {description}
      </p>
    </div>
  );
};

export default LoadingState;
