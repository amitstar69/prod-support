
import { useState, useCallback, useEffect, useRef } from 'react';
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
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loginStartTime, setLoginStartTime] = useState<number | null>(null);
  const [requestAbortController, setRequestAbortController] = useState<AbortController | null>(null);
  const [emailVerified, setEmailVerified] = useState<boolean | null>(null);
  const unmounted = useRef(false);

  // Prevent state updates after unmount
  useEffect(() => {
    return () => {
      unmounted.current = true;
    };
  }, []);

  // Memoize handlers to prevent unnecessary re-renders
  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setEmailError('');
  }, []);

  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setPasswordError('');
  }, []);

  const handleUserTypeChange = useCallback((type: UserType) => {
    setUserType(type);
    setError('');
  }, []);

  const handleRememberMeChange = useCallback(() => setRememberMe(prev => !prev), []);

  // Validation functions
  const validateEmail = useCallback(() => {
    if (!email) {
      setEmailError('Email is required');
      return false;
    }
    
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    
    setEmailError('');
    return true;
  }, [email]);

  const validatePassword = useCallback(() => {
    if (!password) {
      setPasswordError('Password is required');
      return false;
    }
    
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    
    setPasswordError('');
    return true;
  }, [password]);

  // Check if email is verified
  const checkEmailVerified = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('Error getting user:', error);
        return false;
      }
      
      if (data.user) {
        return data.user.email_confirmed_at !== null;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking email verification:', error);
      return false;
    }
  }, []);

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
      console.log(`User is authenticated, redirecting to dashboard`);
      
      // First check if their profile is complete
      const checkProfileCompletion = async () => {
        try {
          // For demonstration, we're fetching from profiles table
          // You would need to implement this based on your specific schema
          const { data, error } = await supabase
            .from('profiles')
            .select('profileCompletionPercentage')
            .eq('id', (await supabase.auth.getUser()).data.user?.id)
            .single();
            
          if (!error && data && data.profileCompletionPercentage < 50) {
            // Profile is incomplete, redirect to complete profile
            navigate(userType === 'client' ? '/onboarding/client' : '/onboarding/developer');
            return;
          }
        } catch (error) {
          console.error('Error checking profile completion:', error);
        }
        
        // Short timeout to ensure state updates complete
        setTimeout(() => {
          const destination = userType === 'client' ? '/client-dashboard' : '/developer-dashboard';
          navigate(destination);
        }, 300);
      };
      
      checkProfileCompletion();
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
        if (!unmounted.current) {
          setIsLoading(false);
          setLoginStartTime(null);
          setRequestAbortController(null);
          
          // Show error toast
          toast.error('Login request timed out. Please try again.');
          setError('Login request timed out. Please try again.');
        }
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
    
    // Clear previous errors
    setError('');
    setEmailError('');
    setPasswordError('');
    
    // Validate form inputs
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();
    
    if (!isEmailValid || !isPasswordValid) {
      return;
    }
    
    if (isLoading || authLoading) {
      console.log('Login already in progress, preventing double submission');
      return;
    }
    
    // Create a new AbortController
    const controller = new AbortController();
    setRequestAbortController(controller);
    
    // Set loading state
    setIsLoading(true);
    const startTime = Date.now();
    setLoginStartTime(startTime);
    console.log(`Attempting to login: ${email} as ${userType} at ${startTime}`);
    
    try {
      // First check if this user has a verified email
      // For this to work properly, Supabase must have "Confirm email" enabled
      // in Authentication > Email settings
      const { data: userData } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      const user = userData?.user;
      
      // Check if email is verified
      if (user && user.email_confirmed_at === null) {
        await supabase.auth.signOut();
        
        // Show verification required message
        setError('Please verify your email before logging in.');
        
        // Add email to URL params and show verification component
        navigate(`/login?error=email-verification&email=${encodeURIComponent(email)}`);
        
        setIsLoading(false);
        setLoginStartTime(null);
        setRequestAbortController(null);
        return;
      }
      
      // Proceed with normal login flow
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
      if (!unmounted.current && !isAuthenticated) {
        setIsLoading(false);
        setLoginStartTime(null);
        setRequestAbortController(null);
      }
    }
  }, [email, password, userType, isLoading, authLoading, login, isAuthenticated, validateEmail, validatePassword, navigate]);

  return {
    email,
    password,
    userType,
    isLoading: isLoading || authLoading,
    error,
    emailError,
    passwordError,
    rememberMe,
    handleEmailChange,
    handlePasswordChange,
    handleUserTypeChange,
    handleRememberMeChange,
    validateEmail,
    validatePassword,
    handleSubmit,
    checkAuthStatus,
    isAuthenticated
  };
};
