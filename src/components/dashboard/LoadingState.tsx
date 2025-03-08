
import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingState: React.FC = () => {
  return (
    <div className="flex flex-col justify-center items-center py-12 space-y-4">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <span className="text-lg text-muted-foreground">Loading requests...</span>
      <p className="text-sm text-center text-muted-foreground max-w-md">
        We're retrieving the latest help requests for you to browse.
      </p>
    </div>
  );
};

export default LoadingState;
