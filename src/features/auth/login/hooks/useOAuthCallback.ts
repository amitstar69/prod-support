
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { handleOAuthCallback } from '@/contexts/auth/authOAuth';
import { toast } from 'sonner';

export const useOAuthCallback = () => {
  const location = useLocation();
  const [isProcessingOAuth, setIsProcessingOAuth] = useState(false);
  const [oAuthError, setOAuthError] = useState<string | null>(null);
  
  useEffect(() => {
    const handleOAuthRedirect = async () => {
      const searchParams = new URLSearchParams(location.search);
      const fromOAuth = searchParams.get('from') === 'oauth';
      
      if (!fromOAuth) {
        return;
      }
      
      setIsProcessingOAuth(true);
      
      try {
        const result = await handleOAuthCallback();
        
        if (!result.success) {
          console.error('OAuth callback failed:', result.error);
          setOAuthError(result.error || 'Authentication failed');
          toast.error(result.error || 'Authentication failed');
        } else {
          toast.success('Successfully signed in!');
          // Let the main login page handle the redirect
        }
      } catch (error: any) {
        console.error('Error handling OAuth callback:', error);
        setOAuthError(error.message || 'Authentication failed');
        toast.error('Authentication error');
      } finally {
        setIsProcessingOAuth(false);
      }
    };
    
    handleOAuthRedirect();
  }, [location.search]);
  
  return {
    isProcessingOAuth,
    oAuthError
  };
};
