
import { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/auth';
import { toast } from 'sonner';
import { useLoginErrors } from './auth/login/useLoginErrors';
import { useAuthStatus } from './auth/login/useAuthStatus';
import { validateEmail, validatePassword } from './auth/login/validation';
import { UserType } from '../contexts/auth/types';

export const useLoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, userType } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginUserType, setLoginUserType] = useState<UserType>('client');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [consecutiveErrors, setConsecutiveErrors] = useState(0);
  
  const {
    error,
    emailError,
    passwordError,
    clearAllErrors,
    setLoginError,
    setFieldError
  } = useLoginErrors();

  const { checkAuthStatus, handleResendVerification } = useAuthStatus();

  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    clearAllErrors();
  }, [clearAllErrors]);

  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    clearAllErrors();
  }, [clearAllErrors]);

  const handleUserTypeChange = useCallback((type: UserType) => {
    setLoginUserType(type);
    clearAllErrors();
  }, [clearAllErrors]);

  const handleRememberMeChange = useCallback(() => {
    setRememberMe(prev => !prev);
  }, []);

  const validateForm = useCallback(() => {
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setFieldError('email', emailValidation.error);
      return false;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setFieldError('password', passwordValidation.error);
      return false;
    }

    return true;
  }, [email, password, setFieldError]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    clearAllErrors();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    console.log(`Attempting to login: ${email} as ${loginUserType} with Remember Me: ${rememberMe}`);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 10000);
      
      const result = await Promise.race([
        login(email, password, loginUserType, rememberMe),
        new Promise((_, reject) => {
          controller.signal.addEventListener('abort', () => {
            reject(new Error('Login request timed out'));
          });
        })
      ]).catch(error => {
        setConsecutiveErrors(prev => prev + 1);
        throw error;
      });
      
      clearTimeout(timeoutId);
      
      if (result.success) {
        setConsecutiveErrors(0);
        clearAllErrors();
        toast.success(`Successfully logged in as ${loginUserType}`);
        
        const params = new URLSearchParams(location.search);
        const returnTo = params.get('returnTo');
        const redirectPath = returnTo && returnTo.startsWith('/') 
          ? returnTo
          : loginUserType === 'developer' ? '/developer-dashboard' : '/client-dashboard';
            
        navigate(redirectPath, { replace: true });
      } else if (result.requiresVerification) {
        setLoginError('Please verify your email before logging in.');
        toast.error('Email verification required');
      } else if (result.error) {
        setLoginError(result.error);
        
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
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      if (error.name === 'AbortError' || error.message?.includes('timed out')) {
        setLoginError('Login request timed out. Please check your internet connection and try again.');
        toast.error('Connection timed out');
      } else {
        setLoginError(error.message || 'An unexpected error occurred during login');
        toast.error(error.message || 'Login failed. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [email, password, loginUserType, rememberMe, isLoading, login, navigate, location.search, consecutiveErrors, clearAllErrors, setLoginError, validateForm]);

  return {
    email,
    password,
    userType: loginUserType,
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
    validateEmail: () => {
      const validation = validateEmail(email);
      if (!validation.isValid) {
        setFieldError('email', validation.error);
      }
      return validation.isValid;
    },
    validatePassword: () => {
      const validation = validatePassword(password);
      if (!validation.isValid) {
        setFieldError('password', validation.error);
      }
      return validation.isValid;
    },
    handleResendVerification: async () => {
      try {
        await handleResendVerification(email);
        toast.success('Verification email sent!');
      } catch (error: any) {
        console.error('Error in resend verification:', error);
        toast.error('Failed to resend verification email');
      }
    }
  };
};
