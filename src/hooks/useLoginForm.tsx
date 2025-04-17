
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/auth';
import { toast } from 'sonner';
import { supabase } from '../integrations/supabase/client';

export type UserType = 'client' | 'developer';

export const useLoginForm = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<UserType>('client');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [consecutiveErrors, setConsecutiveErrors] = useState(0);

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
    setUserType(type);
    setError('');
  }, []);
  
  const handleRememberMeChange = useCallback(() => {
    setRememberMe(prev => !prev);
  }, []);

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

  const checkAuthStatus = async () => {
    const { data, error } = await supabase.auth.getSession();
    console.log('Current auth status (LoginPage):', { session: data.session, error });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    console.log(`Attempting to login: ${email} as ${userType} with Remember Me: ${rememberMe}`);
    
    try {
      // Basic form validation
      const isEmailValid = validateEmail();
      const isPasswordValid = validatePassword();
      
      if (!isEmailValid || !isPasswordValid) {
        setIsLoading(false);
        return;
      }
      
      // Add timeout to prevent UI from being stuck indefinitely
      const loginPromise = login(email, password, userType, rememberMe);
      
      // Set a timeout for the login process
      const timeoutPromise = new Promise<boolean>((_, reject) => {
        setTimeout(() => reject(new Error('Login request timed out')), 10000);
      });
      
      // Race between login and timeout
      const result = await Promise.race([loginPromise, timeoutPromise])
        .catch(error => {
          console.error('Login error or timeout:', error);
          setConsecutiveErrors(prev => prev + 1);
          
          if (error.message.includes('timeout')) {
            toast.error('Login timed out. Please check your internet and try again.');
          } else {
            toast.error(error.message || 'Login timed out. Please try again.');
          }
          return { success: false, error: error.message || 'Login timed out' };
        });
      
      console.log('Login result:', result);
      
      if (result.success) {
        // Reset error counter on success
        setConsecutiveErrors(0);
        
        console.log(`Login successful, redirecting to ${userType === 'developer' ? '/profile' : '/client-profile'}`);
        toast.success(`Successfully logged in as ${userType}`);
        navigate(userType === 'developer' ? '/profile' : '/client-profile');
      } else {
        // Increment consecutive errors
        setConsecutiveErrors(prev => prev + 1);
        
        if (result.requiresVerification) {
          // Special handling for unverified emails
          setError('Please verify your email before logging in.');
          toast.warning('Email verification required', {
            description: 'Please check your inbox and verify your email address',
            action: {
              label: 'Resend',
              onClick: () => handleResendVerification()
            }
          });
        } else if (result.error) {
          setError(result.error);
          
          // If too many consecutive errors, suggest contacting support
          if (consecutiveErrors >= a) {
            toast.error('Multiple login failures', {
              description: 'Please check your credentials or contact support',
              action: {
                label: 'Help',
                onClick: () => navigate('/help')
              }
            });
          }
        } else {
          setError('Login failed. Please check your credentials and try again.');
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setConsecutiveErrors(prev => prev + 1);
      
      setError('An unexpected error occurred during login');
      toast.error('Login failed. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // New function to handle resending verification emails
  const handleResendVerification = async () => {
    if (!email) {
      toast.error('Please enter your email address first');
      return;
    }
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      
      if (error) {
        console.error('Error resending verification:', error);
        toast.error(`Failed to resend: ${error.message}`);
      } else {
        toast.success('Verification email sent!');
      }
    } catch (error: any) {
      console.error('Error in resend verification:', error);
      toast.error('Failed to resend verification email');
    }
  };

  return {
    email,
    password,
    userType,
    isLoading,
    error,
    emailError,
    passwordError,
    rememberMe,
    handleEmailChange,
    handlePasswordChange,
    handleUserTypeChange,
    handleRememberMeChange,
    handleSubmit,
    checkAuthStatus,
    isAuthenticated,
    validateEmail,
    validatePassword,
    handleResendVerification
  };
};
