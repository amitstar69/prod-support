
import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/auth';
import { toast } from 'sonner';
import { supabase } from '../integrations/supabase/client';

export type UserType = 'client' | 'developer';

export const useLoginForm = () => {
  console.log('useLoginForm initialized');
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

  const checkAuthStatus = useCallback(async () => {
    try {
      console.log('Checking auth status');
      const { data } = await supabase.auth.getSession();
      console.log('Auth session check result:', data.session ? 'Has session' : 'No session');
    } catch (error) {
      console.error('Error checking auth status:', error);
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
    console.log(`Attempting to login: ${email} as ${userType}`);
    
    try {
      const success = await login(email, password, userType);
      
      console.log('Login result:', success ? 'Success' : 'Failed');
      
      if (success) {
        toast.success(`Successfully logged in as ${userType}`);
      } else {
        setError('Login failed. Please check your credentials and try again.');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'An unexpected error occurred during login');
      toast.error(error.message || 'Login failed. Please try again later.');
    } finally {
      if (!isAuthenticated) {
        setIsLoading(false);
      }
    }
  }, [email, password, userType, isLoading, authLoading, validateEmail, validatePassword, login, isAuthenticated]);

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
