
import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/auth';
import { toast } from 'sonner';
import { supabase } from '../integrations/supabase/client';

export type UserType = 'client' | 'developer';

export const useLoginForm = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<UserType>('client');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loginStartTime, setLoginStartTime] = useState<number | null>(null);
  const [requestAbortController, setRequestAbortController] = useState<AbortController | null>(null);

  // Memoize handlers to prevent unnecessary re-renders
  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value), []);
  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value), []);
  const handleUserTypeChange = useCallback((type: UserType) => setUserType(type), []);
  const handleRememberMeChange = useCallback(() => setRememberMe(prev => !prev), []);

  // Performance optimization: Use cached session first
  const checkAuthStatus = useCallback(async () => {
    try {
      const cachedSession = localStorage.getItem('supabase.auth.token');
      if (cachedSession) {
        console.log('Found cached session, assuming authenticated until backend check completes');
      }
      
      const { data, error } = await supabase.auth.getSession();
      console.log('Current auth status (LoginPage):', { session: data.session, error });
    } catch (error) {
      console.error('Error checking auth status:', error);
    }
  }, []);

  // Redirect on authentication state change
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      console.log(`User is authenticated, redirecting to ${userType === 'client' ? '/client' : '/developer-dashboard'}`);
      
      // Short timeout to ensure state updates complete
      setTimeout(() => {
        const destination = userType === 'client' ? '/client' : '/developer-dashboard';
        navigate(destination);
      }, 300); // Increased timeout for more reliable state updates
    }
  }, [isAuthenticated, isLoading, navigate, userType]);

  // New useEffect to detect if login has been stuck for too long
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    
    if (isLoading && loginStartTime) {
      // If loading for more than 15 seconds, consider it stuck and abort
      timeoutId = setTimeout(() => {
        console.log('Login seems to be stuck, aborting request and resetting state');
        
        // Abort any pending request
        if (requestAbortController) {
          requestAbortController.abort();
        }
        
        // Reset states
        setIsLoading(false);
        setLoginStartTime(null);
        setRequestAbortController(null);
        
        // Show error toast
        toast.error('Login request timed out. Please try again.');
        setError('Login request timed out. Please try again.');
      }, 15000); // Increased from 10s to 15s to allow more time for slow connections
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isLoading, loginStartTime, requestAbortController]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      // Abort any pending request when component unmounts
      if (requestAbortController) {
        requestAbortController.abort();
      }
    };
  }, [requestAbortController]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Email and password are required');
      toast.error('Please enter both email and password');
      return;
    }
    
    if (isLoading || authLoading) {
      console.log('Login already in progress, preventing double submission');
      return;
    }
    
    // Clear previous error
    setError('');
    
    // Create a new AbortController
    const controller = new AbortController();
    setRequestAbortController(controller);
    
    // Set loading state
    setIsLoading(true);
    const startTime = Date.now();
    setLoginStartTime(startTime);
    console.log(`Attempting to login: ${email} as ${userType} at ${startTime}`);
    
    try {
      // Pass the abort signal to the login function if possible
      const loginPromise = login(email, password, userType);
      
      // Add timeout safety net in case the AbortController doesn't work
      const timeoutPromise = new Promise<boolean>((_, reject) => {
        setTimeout(() => reject(new Error('Login request timed out')), 14000);
      });
      
      const success = await Promise.race([loginPromise, timeoutPromise])
        .catch(error => {
          // Check if request was aborted
          if (error.name === 'AbortError') {
            console.log('Login request was aborted');
            return false;
          }
          
          console.error('Login error or timeout:', error);
          toast.error(error.message || 'Login timed out. Please try again.');
          setError(error.message || 'Login timed out. Please try again.');
          return false;
        });
      
      console.log('Login result:', success ? 'Success' : 'Failed');
      
      if (success) {
        toast.success(`Successfully logged in as ${userType}`);
        // Login successful - will redirect in the useEffect
      } else if (!error) {
        setError('Login failed. Please check your credentials and try again.');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'An unexpected error occurred during login');
      toast.error(error.message || 'Login failed. Please try again later.');
    } finally {
      // Only reset loading if not authenticated yet
      if (!isAuthenticated) {
        setIsLoading(false);
        setLoginStartTime(null);
        setRequestAbortController(null);
      }
    }
  }, [email, password, userType, isLoading, authLoading, login, isAuthenticated]);

  return {
    email,
    password,
    userType,
    isLoading: isLoading || authLoading,
    error,
    rememberMe,
    handleEmailChange,
    handlePasswordChange,
    handleUserTypeChange,
    handleRememberMeChange,
    handleSubmit,
    checkAuthStatus,
    isAuthenticated
  };
};
