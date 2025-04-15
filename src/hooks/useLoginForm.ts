
import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/auth';
import { toast } from 'sonner';
import { supabase } from '../integrations/supabase/client';

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
      const result = await login(email, password, loginUserType);
      
      const isSuccess = typeof result === 'boolean' ? result : (result && 'success' in result && result.success);
      const errorMsg = typeof result === 'object' && result && 'error' in result ? result.error : null;
      const requiresVerification = typeof result === 'object' && result && 'requiresVerification' in result ? result.requiresVerification : false;
      
      console.log('Login result:', isSuccess ? 'Success' : 'Failed', requiresVerification ? '(verification required)' : '');
      
      if (isSuccess) {
        toast.success(`Successfully logged in as ${loginUserType}`);
        
        // Get the returnTo parameter from the URL if it exists
        const params = new URLSearchParams(location.search);
        const returnTo = params.get('returnTo');
        
        // Determine where to redirect based on returnTo and user type
        const redirectPath = returnTo && returnTo.startsWith('/')
          ? returnTo
          : loginUserType === 'developer'
            ? '/developer-dashboard' 
            : '/client-dashboard';
            
        navigate(redirectPath, { replace: true });
      } else if (requiresVerification) {
        setError('Please verify your email before logging in.');
        // If using a verification page, you could redirect here
        // navigate(`/email-verification?email=${encodeURIComponent(email)}`);
      } else if (errorMsg) {
        setError(errorMsg);
        toast.error(errorMsg);
      } else {
        setError('Login failed. Please check your credentials and try again.');
        toast.error('Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'An unexpected error occurred during login');
      toast.error(error.message || 'Login failed. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [email, password, loginUserType, isLoading, authLoading, validateEmail, validatePassword, login, navigate, location.search]);

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
