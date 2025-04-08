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

  useEffect(() => {
    return () => {
      unmounted.current = true;
    };
  }, []);

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

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      console.log(`User is authenticated, redirecting to dashboard`);
      
      const checkProfileCompletion = async () => {
        try {
          const userId = (await supabase.auth.getUser()).data.user?.id;
          
          let query;
          if (userType === 'developer') {
            query = supabase
              .from('developer_profiles')
              .select('profile_completion_percentage')
              .eq('id', userId)
              .single();
          } else {
            query = supabase
              .from('client_profiles')
              .select('profile_completion_percentage')
              .eq('id', userId)
              .single();
          }
          
          const { data, error } = await query;
            
          if (!error && data && data.profile_completion_percentage < 50) {
            navigate(userType === 'client' ? '/onboarding/client' : '/onboarding/developer');
            return;
          }
        } catch (error) {
          console.error('Error checking profile completion:', error);
        }
        
        setTimeout(() => {
          const destination = userType === 'client' ? '/client-dashboard' : '/developer-dashboard';
          navigate(destination);
        }, 300);
      };
      
      checkProfileCompletion();
    }
  }, [isAuthenticated, isLoading, navigate, userType]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    
    if (isLoading && loginStartTime) {
      timeoutId = setTimeout(() => {
        console.log('Login seems to be stuck, aborting request and resetting state');
        
        if (requestAbortController) {
          requestAbortController.abort();
        }
        
        if (!unmounted.current) {
          setIsLoading(false);
          setLoginStartTime(null);
          setRequestAbortController(null);
          
          toast.error('Login request timed out. Please try again.');
          setError('Login request timed out. Please try again.');
        }
      }, 15000);
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isLoading, loginStartTime, requestAbortController]);

  useEffect(() => {
    return () => {
      if (requestAbortController) {
        requestAbortController.abort();
      }
    };
  }, [requestAbortController]);

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
      console.log('Login already in progress, preventing double submission');
      return;
    }
    
    const controller = new AbortController();
    setRequestAbortController(controller);
    
    setIsLoading(true);
    const startTime = Date.now();
    setLoginStartTime(startTime);
    console.log(`Attempting to login: ${email} as ${userType} at ${startTime}`);
    
    try {
      const { data: userData } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      const user = userData?.user;
      
      if (user && user.email_confirmed_at === null) {
        await supabase.auth.signOut();
        
        setError('Please verify your email before logging in.');
        
        navigate(`/login?error=email-verification&email=${encodeURIComponent(email)}`);
        
        setIsLoading(false);
        setLoginStartTime(null);
        setRequestAbortController(null);
        return;
      }
      
      const loginPromise = login(email, password, userType);
      
      const timeoutPromise = new Promise<boolean>((_, reject) => {
        setTimeout(() => reject(new Error('Login request timed out')), 14000);
      });
      
      const success = await Promise.race([loginPromise, timeoutPromise])
        .catch(error => {
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
      } else if (!error) {
        setError('Login failed. Please check your credentials and try again.');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'An unexpected error occurred during login');
      toast.error(error.message || 'Login failed. Please try again later.');
    } finally {
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
