
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export type ErrorType = 'network' | 'credentials' | 'verification' | 'general';

interface LoginErrorDisplayProps {
  error?: string;
}

export const LoginErrorDisplay: React.FC<LoginErrorDisplayProps> = ({ error }) => {
  if (!error) return null;
  
  const errorType = getErrorType(error);
  
  return (
    <Alert 
      variant={errorType === 'network' ? 'destructive' : 'default'} 
      className={`py-2 ${
        errorType === 'verification' 
          ? 'border-amber-500 bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300' 
          : ''
      }`}
    >
      <div className="flex items-center gap-2">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="m-0">
          {error}{' '}
          {errorType === 'verification' && (
            <Link to="/forgot-password" className="underline font-medium">
              Resend verification email
            </Link>
          )}
        </AlertDescription>
      </div>
    </Alert>
  );
};

function getErrorType(error: string): ErrorType {
  if (error.includes('Network') || error.includes('connection') || error.includes('timed out')) {
    return 'network';
  } else if (error.includes('credentials') || error.includes('invalid') || error.includes('incorrect')) {
    return 'credentials'; 
  } else if (error.includes('verify') || error.includes('verification') || error.includes('confirmed')) {
    return 'verification';
  }
  return 'general';
}
