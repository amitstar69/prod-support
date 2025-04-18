
import React from 'react';
import { AlertCircle, Wifi, AlertTriangle } from 'lucide-react';

interface LoginErrorDisplayProps {
  error: string;
}

export const LoginErrorDisplay: React.FC<LoginErrorDisplayProps> = ({ error }) => {
  // Determine error type and icon based on the error message
  const getErrorDetails = (error: string) => {
    if (error.includes('timeout') || error.includes('connection') || error.includes('internet')) {
      return {
        icon: <Wifi className="h-4 w-4 text-destructive" />,
        className: 'bg-destructive/10 text-destructive'
      };
    } else if (error.includes('too many') || error.includes('attempts')) {
      return {
        icon: <AlertTriangle className="h-4 w-4 text-amber-600" />,
        className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-500'
      };
    } else if (error.includes('verify') || error.includes('verification')) {
      return {
        icon: <AlertTriangle className="h-4 w-4 text-amber-600" />,
        className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-500'
      };
    }
    
    return {
      icon: <AlertCircle className="h-4 w-4 text-destructive" />,
      className: 'bg-destructive/10 text-destructive'
    };
  };
  
  const { icon, className } = getErrorDetails(error);
  
  return (
    <div className={`${className} flex items-start gap-2 text-sm p-3 rounded-md`}>
      {icon}
      <span>{error}</span>
    </div>
  );
};
