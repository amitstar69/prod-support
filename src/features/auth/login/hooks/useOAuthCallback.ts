
import { useEffect, useState } from 'react';
import { handleOAuthCallback } from '@/contexts/auth/authOAuth';
import { toast } from 'sonner';

export const useOAuthCallback = () => {
  const [isProcessingOAuth, setIsProcessingOAuth] = useState(false);
  const [oAuthError, setOAuthError] = useState<string | null>(null);
  
  useEffect(() => {
    const checkForOAuthCallback = async () => {
      // Check if this is potentially an OAuth callback
      const url = new URL(window.location.href);
      const hasCallbackParams = url.hash.includes('access_token') || url.searchParams.has('code');
      
      if (hasCallbackParams) {
        setIsProcessingOAuth(true);
        
        try {
          const result = await handleOAuthCallback();
          
          if (result.success) {
            toast.success(`Successfully logged in${result.userType ? ` as ${result.userType}` : ''}`);
          } else {
            setOAuthError(result.error || 'Authentication failed');
            toast.error(result.error || 'Authentication failed');
          }
        } catch (error: any) {
          console.error('Error handling OAuth callback:', error);
          setOAuthError(error.message || 'Failed to complete authentication');
          toast.error(error.message || 'Failed to complete authentication');
        } finally {
          setIsProcessingOAuth(false);
        }
        
        // Clean up URL
        window.history.replaceState(null, '', window.location.pathname);
      }
    };
    
    checkForOAuthCallback();
  }, []);
  
  return {
    isProcessingOAuth,
    oAuthError
  };
};
