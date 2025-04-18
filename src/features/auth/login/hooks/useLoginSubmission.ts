
import { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { UserType } from '@/contexts/auth/types';
import { LoginResult } from '@/contexts/auth/authLogin';
import { getUserHomePage } from '@/utils/navigationUtils';
import { getCurrentUserData } from '@/contexts/auth/userDataFetching';

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

  // Debug mode detection
  const isDevMode = process.env.NODE_ENV === 'development';
  
  const debugLog = (message: string, data?: any) => {
    if (isDevMode) {
      console.log(`[Auth Debug] ${message}`, data || '');
    }
  };

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
    debugLog(`Login request started for ${email} as ${userType}`);
    
    try {
      // Create abort controller for login timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        debugLog('Login request timed out after 8 seconds');
      }, 8000); // Reduced from 10000 to 8000ms
      
      const loginPromise = login(email, password, userType, rememberMe);
      
      // Create timeout promise
      const timeoutPromise = new Promise<LoginResult>((_, reject) => {
        controller.signal.addEventListener('abort', () => {
          reject(new Error('Login request timed out. Please check your internet connection and try again.'));
        });
      });
      
      // Race between login and timeout
      const result = await Promise.race([
        loginPromise,
        timeoutPromise
      ]).catch((error: Error) => {
        setConsecutiveErrors(prev => prev + 1);
        debugLog('Login failed with error:', error.message);
        return {
          success: false,
          error: error.message || 'Login request failed'
        } as LoginResult;
      });
      
      clearTimeout(timeoutId);
      
      if (result.success) {
        debugLog('Login successful, fetching user profile');
        setConsecutiveErrors(0);
        
        // Create a timeout for profile fetch
        const profileController = new AbortController();
        const profileTimeoutId = setTimeout(() => {
          profileController.abort();
          debugLog('Profile fetch timed out after 5 seconds');
        }, 5000);
        
        try {
          // Fetch user profile after successful login
          const profilePromise = getCurrentUserData();
          const profileTimeoutPromise = new Promise((_, reject) => {
            profileController.signal.addEventListener('abort', () => {
              reject(new Error('Profile fetch timed out'));
            });
          });
          
          const userData = await Promise.race([profilePromise, profileTimeoutPromise])
            .catch(() => null);
          
          clearTimeout(profileTimeoutId);
          
          if (userData) {
            debugLog('User profile fetched successfully');
            // Fix: Type assertion for userData and safe access to name property
            const userName = userData && typeof userData === 'object' ? 
              (userData as { name?: string }).name || 'User' : 
              'User';
            toast.success(`Welcome back, ${userName}!`);
          } else {
            debugLog('User profile fetch failed, using default redirection');
            toast.success(`Successfully logged in as ${userType}`);
          }
          
          // Determine redirection path
          const params = new URLSearchParams(location.search);
          const returnTo = params.get('returnTo');
          
          // Get the appropriate home page based on user type
          const homePath = getUserHomePage(userType);
          const redirectPath = returnTo && returnTo.startsWith('/') ? returnTo : homePath;
          
          debugLog(`User redirected to: ${redirectPath}`);
          navigate(redirectPath, { replace: true });
          onSuccess?.();
          
          return true;
        } catch (profileError: any) {
          debugLog('Error fetching user profile:', profileError.message);
          clearTimeout(profileTimeoutId);
          
          // Show warning but still complete login
          toast.warning('Unable to load your profile data. Some features may be limited.');
          
          // Default redirect if profile fetch fails
          const fallbackPath = userType === 'developer' ? '/developer/dashboard' : '/client/dashboard';
          debugLog(`Fallback redirect to: ${fallbackPath}`);
          navigate(fallbackPath, { replace: true });
          onSuccess?.();
          
          return true;
        }
      } else if (result.requiresVerification) {
        debugLog('Email verification required');
        onVerificationRequired?.(email);
        toast.error('Email verification required');
        return false;
      } else if (result.error) {
        debugLog('Login error:', result.error);
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
      debugLog('Unexpected login error:', error.message);
      
      if (error.name === 'AbortError' || error.message?.includes('timed out')) {
        onError?.('Login request timed out. Please check your internet connection and try again.');
        toast.error('Connection timed out', {
          description: 'Please check your internet connection and try again.'
        });
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
