
import { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { UserType } from '@/contexts/auth/types';
import { LoginResult } from '@/contexts/auth/authLogin';

interface UseLoginSubmissionProps {
  login: (email: string, password: string, userType: UserType, rememberMe: boolean) => Promise<LoginResult>;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  onVerificationRequired?: (email: string) => void;
}

export const useLoginSubmission = ({ 
  login,
  onSuccess,
  onError,
  onVerificationRequired
}: UseLoginSubmissionProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [consecutiveErrors, setConsecutiveErrors] = useState(0);

  const handleLoginSubmit = useCallback(async (
    email: string,
    password: string,
    userType: UserType,
    rememberMe: boolean,
    isValid: boolean
  ): Promise<boolean> => {
    if (!isValid) {
      return false;
    }
    
    setIsLoading(true);
    console.log(`Attempting to login: ${email} as ${userType} with Remember Me: ${rememberMe}`);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 10000);
      
      const loginPromise = login(email, password, userType, rememberMe);
      const timeoutPromise = new Promise<LoginResult>((_, reject) => {
        controller.signal.addEventListener('abort', () => {
          reject(new Error('Login request timed out'));
        });
      });
      
      const result = await Promise.race([
        loginPromise,
        timeoutPromise
      ]).catch((error: Error) => {
        setConsecutiveErrors(prev => prev + 1);
        return {
          success: false,
          error: error.message || 'Login request failed'
        } as LoginResult;
      });
      
      clearTimeout(timeoutId);
      
      if (result.success) {
        setConsecutiveErrors(0);
        toast.success(`Successfully logged in as ${userType}`);
        
        const params = new URLSearchParams(location.search);
        const returnTo = params.get('returnTo');
        const redirectPath = returnTo && returnTo.startsWith('/') 
          ? returnTo
          : userType === 'developer' ? '/developer-dashboard' : '/client-dashboard';
        
        navigate(redirectPath, { replace: true });
        onSuccess?.();
        return true;
      } else if (result.requiresVerification) {
        onVerificationRequired?.(email);
        toast.error('Email verification required');
        return false;
      } else if (result.error) {
        onError?.(result.error);
        
        if (consecutiveErrors >= 3) {
          toast.error('Multiple login failures', {
            description: 'Please check your credentials or contact support',
            action: {
              label: 'Help',
              onClick: () => navigate('/help')
            }
          });
        } else {
          toast.error(result.error);
        }
        return false;
      }
      return false;
    } catch (error: any) {
      console.error('Login error:', error);
      
      if (error.name === 'AbortError' || error.message?.includes('timed out')) {
        onError?.('Login request timed out. Please check your internet connection and try again.');
        toast.error('Connection timed out');
      } else {
        onError?.(error.message || 'An unexpected error occurred during login');
        toast.error(error.message || 'Login failed. Please try again later.');
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [login, navigate, location.search, consecutiveErrors, onSuccess, onError, onVerificationRequired]);

  return {
    isLoading,
    handleLoginSubmit
  };
};
