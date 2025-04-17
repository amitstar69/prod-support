
import { useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { useAuthStatus } from '@/hooks/auth/login/useAuthStatus';
import { useLoginState } from './useLoginState';
import { useLoginValidation } from './useLoginValidation';
import { useLoginSubmission } from './useLoginSubmission';
import { toast } from 'sonner';

export const useLoginForm = () => {
  const { login, loginWithOAuth, isAuthenticated, userType } = useAuth();
  
  // Form state management
  const {
    email,
    password,
    userType: loginUserType,
    rememberMe,
    generalError,
    setGeneralError,
    handleEmailChange,
    handlePasswordChange,
    handleUserTypeChange,
    handleRememberMeChange
  } = useLoginState();
  
  // Validation logic
  const {
    errors: validationErrors,
    validateEmail,
    validatePassword,
    validateForm,
    clearErrors
  } = useLoginValidation();
  
  // Auth status hooks
  const { checkAuthStatus, handleResendVerification } = useAuthStatus();
  
  // Submission logic
  const {
    isLoading,
    handleLoginSubmit
  } = useLoginSubmission({
    login,
    onError: setGeneralError,
    onVerificationRequired: (email) => {
      setGeneralError('Please verify your email before logging in.');
    }
  });
  
  // Form submission handler
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    
    const validation = validateForm(email, password);
    if (!validation.isValid) {
      return;
    }
    
    await handleLoginSubmit(email, password, loginUserType, rememberMe, true);
  }, [email, password, loginUserType, rememberMe, clearErrors, validateForm, handleLoginSubmit]);

  // Social login handlers
  const handleGoogleLogin = useCallback(async () => {
    try {
      const result = await loginWithOAuth('google', loginUserType);
      if (!result.success && result.error) {
        toast.error(result.error);
        setGeneralError(result.error);
      }
    } catch (error: any) {
      console.error('Google login error:', error);
      toast.error('Failed to sign in with Google');
      setGeneralError(error.message || 'Failed to sign in with Google');
    }
  }, [loginWithOAuth, loginUserType, setGeneralError]);

  const handleGithubLogin = useCallback(async () => {
    try {
      const result = await loginWithOAuth('github', loginUserType);
      if (!result.success && result.error) {
        toast.error(result.error);
        setGeneralError(result.error);
      }
    } catch (error: any) {
      console.error('GitHub login error:', error);
      toast.error('Failed to sign in with GitHub');
      setGeneralError(error.message || 'Failed to sign in with GitHub');
    }
  }, [loginWithOAuth, loginUserType, setGeneralError]);
  
  return {
    email,
    password,
    userType: loginUserType,
    isLoading,
    error: generalError,
    emailError: validationErrors.email,
    passwordError: validationErrors.password,
    rememberMe,
    handleEmailChange,
    handlePasswordChange,
    handleUserTypeChange,
    handleRememberMeChange,
    handleSubmit,
    handleGoogleLogin,
    handleGithubLogin,
    checkAuthStatus,
    isAuthenticated,
    validateEmail: () => validateEmail(email),
    validatePassword: () => validatePassword(password),
    handleResendVerification: async () => {
      try {
        await handleResendVerification(email);
        return true;
      } catch (error) {
        console.error('Error in resend verification:', error);
        return false;
      }
    }
  };
};
