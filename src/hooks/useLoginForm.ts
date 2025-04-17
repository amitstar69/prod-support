
import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/auth';
import { toast } from 'sonner';
import { supabase } from '../integrations/supabase/client';
import { LoginResult } from '../contexts/auth/authLogin';

export type UserType = 'client' | 'developer';

export const useLoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, userType, isLoading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginUserType, setLoginUserType] = useState<UserType>('client');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setEmailError('');
    setError('');
  }, []);

  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setPasswordError('');
    setError('');
  }, []);

  const handleUserTypeChange = useCallback((type: UserType) => {
    setLoginUserType(type);
    setError('');
  }, []);

  const handleRememberMeChange = useCallback(() => setRememberMe(prev => !prev), []);

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

  // Handle redirect if user is already authenticated
  useEffect(() => {
    if (isAuthenticated && userType) {
      console.log('User already authenticated, redirecting');
      // Get the intended destination from URL params if available
      const params = new URLSearchParams(location.search);
      const returnTo = params.get('returnTo');
      
      // Determine where to redirect based on user type and returnTo parameter
      let destination = returnTo && returnTo.startsWith('/') 
        ? returnTo
        : userType === 'developer' 
          ? '/developer-dashboard' 
          : '/client-dashboard';
      
      console.log(`User already authenticated as ${userType}, redirecting to`, destination);
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, userType, navigate, location.search]);

  const checkAuthStatus = useCallback(async () => {
    try {
      console.log('Checking auth status');
      const { data } = await supabase.auth.getSession();
      console.log('Auth session check result:', data.session ? 'Has session' : 'No session');
      return !!data.session;
    } catch (error) {
      console.error('Error checking auth status:', error);
      return false;
    }
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    setError('');
    setEmailError('');
    setPasswordError('');
    
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();
    
    if (!isEmailValid || !isPasswordValid) {
      return;
    }
    
    if (isLoading || authLoading) {
      console.log('Login already in progress');
      return;
    }
    
    setIsLoading(true);
    console.log(`Attempting to login: ${email} as ${loginUserType}`);
    
    try {
      // Create an AbortController for the timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.warn('Login request timed out after 10 seconds');
        controller.abort();
      }, 10000);
      
      // Call login and get the result with the correct type
      const loginPromise = login(email, password, loginUserType);
      
      // We'll race the login promise against an abort signal
      const result = await Promise.race([
        loginPromise,
        new Promise<LoginResult>((_, reject) => {
          controller.signal.addEventListener('abort', () => {
            reject(new Error('Login request timed out'));
          });
        })
      ]).catch(error => {
        console.error('Login error or timeout:', error);
        clearTimeout(timeoutId);
        return {
          success: false,
          error: error.message || 'Login request failed'
        } as LoginResult;
      });
      
      clearTimeout(timeoutId);
      
      console.log('Login result:', result.success ? 'Success' : 'Failed', 
        result.requiresVerification ? '(verification required)' : '');
      
      if (result.success) {
        toast.success(`Successfully logged in as ${loginUserType}`);
        
        // Double check we have a user type before redirecting
        const activeUserType = userType || loginUserType;
        
        // Get the returnTo parameter from the URL if it exists
        const params = new URLSearchParams(location.search);
        const returnTo = params.get('returnTo');
        
        // Determine where to redirect based on returnTo and user type
        const redirectPath = returnTo && returnTo.startsWith('/')
          ? returnTo
          : activeUserType === 'developer'
            ? '/developer-dashboard' 
            : '/client-dashboard';
            
        console.log(`Login successful, redirecting to ${redirectPath}`);
        navigate(redirectPath, { replace: true });
      } else if (result.requiresVerification) {
        setError('Please verify your email before logging in.');
        toast.error('Email verification required');
      } else if (result.error) {
        setError(result.error);
        toast.error(result.error);
      } else {
        setError('Login failed. Please check your credentials and try again.');
        toast.error('Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle timeout errors specially
      if (error.name === 'AbortError' || error.message?.includes('timed out')) {
        setError('Login request timed out. Please check your internet connection and try again.');
        toast.error('Connection timed out');
      } else {
        setError(error.message || 'An unexpected error occurred during login');
        toast.error(error.message || 'Login failed. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [email, password, loginUserType, isLoading, authLoading, validateEmail, validatePassword, login, navigate, location.search, userType]);

  return {
    email,
    password,
    userType: loginUserType,
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
