
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
    if (isAuthenticated && loginStartTime) {
      const loginEndTime = Date.now();
      const loginDuration = loginEndTime - loginStartTime;
      console.log(`Login process completed in ${loginDuration}ms`);
      
      setIsLoading(false);
      setLoginStartTime(null);
      
      const destination = userType === 'client' ? '/client' : '/developer-dashboard';
      console.log(`Redirecting authenticated user to ${destination}`);
      navigate(destination);
    }
  }, [isAuthenticated, loginStartTime, navigate, userType]);

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
    
    setError('');
    setIsLoading(true);
    const startTime = Date.now();
    setLoginStartTime(startTime);
    console.log(`Attempting to login: ${email} as ${userType} at ${startTime}`);
    
    try {
      const loginPromise = login(email, password, userType);
      
      // Add timeout for better UX
      const timeoutPromise = new Promise<boolean>((_, reject) => {
        setTimeout(() => reject(new Error('Login request timed out')), 10000);
      });
      
      const success = await Promise.race([loginPromise, timeoutPromise])
        .catch(error => {
          console.error('Login error or timeout:', error);
          toast.error(error.message || 'Login timed out. Please try again.');
          setError(error.message || 'Login timed out. Please try again.');
          return false;
        });
      
      console.log('Login result:', success ? 'Success' : 'Failed');
      
      if (success) {
        console.log(`Login successful, will redirect on auth state change`);
        toast.success(`Successfully logged in as ${userType}`);
      } else if (!error) {
        setError('Login failed. Please check your credentials and try again.');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'An unexpected error occurred during login');
      toast.error(error.message || 'Login failed. Please try again later.');
      setLoginStartTime(null);
    } finally {
      if (!isAuthenticated) {
        setIsLoading(false);
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
