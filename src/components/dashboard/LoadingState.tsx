
import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  text?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ text = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 min-h-[200px]">
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
      <p className="text-muted-foreground">{text}</p>
    </div>
  );
};

export default LoadingState;
