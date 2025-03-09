
import { useEffect } from 'react';
import { toast } from 'sonner';

// This hook provides a mechanism to recover from unexpected errors
export const useEmergencyRecovery = () => {
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled Promise Rejection:', event.reason);
      toast.error('An unexpected error occurred. Please refresh the page.');
    };

    const handleError = (event: ErrorEvent) => {
      console.error('Global Error:', event.error || event.message);
      toast.error('An unexpected error occurred. Please refresh the page.');
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);
};
