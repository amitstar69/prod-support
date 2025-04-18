
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import LoginHeader from '../components/login/LoginHeader';
import { Skeleton } from '../components/ui/skeleton';
import EmailVerificationMessage from '../components/auth/EmailVerificationMessage';
import LoginForm from '../features/auth/login/components/LoginForm';
import { useLoginForm } from '../features/auth/login/hooks/useLoginForm';
import { useOAuthCallback } from '../features/auth/login/hooks/useOAuthCallback';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showVerification, setShowVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);
  const [authCheckComplete, setAuthCheckComplete] = useState(false);
  
  // Debug mode detection
  const isDevMode = process.env.NODE_ENV === 'development';
  const debugLog = (message: string) => {
    if (isDevMode) {
      console.log(`[Auth Debug] ${message}`);
    }
  };
  
  // Process potential OAuth callback
  const { isProcessingOAuth, oAuthError } = useOAuthCallback();
  
  const { 
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
    handleGoogleLogin,
    handleGithubLogin,
    checkAuthStatus,
    isAuthenticated,
    validateEmail,
    validatePassword,
    handleResendVerification
  } = useLoginForm();

  useEffect(() => {
    debugLog('LoginPage - checking URL params');
    const searchParams = new URLSearchParams(location.search);
    const verificationError = searchParams.get('error') === 'email-verification';
    const emailParam = searchParams.get('email');
    
    if (verificationError && emailParam) {
      setVerificationEmail(emailParam);
      setShowVerification(true);
    }
  }, [location.search]);
  
  useEffect(() => {
    debugLog('LoginPage - checking auth status');
    
    // Set a timeout to prevent infinite loading - REDUCED TO 3 SECONDS
    const authCheckTimeout = setTimeout(() => {
      if (!authCheckComplete) {
        debugLog('Auth check taking too long, continuing to login page');
        setInitialLoading(false);
        setAuthCheckComplete(true);
      }
    }, 3000); // 3 seconds timeout (reduced from 5)
    
    // Check auth status
    checkAuthStatus().then(isAuth => {
      debugLog(`Auth check complete: ${isAuth ? 'authenticated' : 'not authenticated'}`);
      clearTimeout(authCheckTimeout);
      setInitialLoading(false);
      setAuthCheckComplete(true);
    }).catch(err => {
      debugLog(`Auth check error: ${err.message}`);
      clearTimeout(authCheckTimeout);
      setInitialLoading(false);
      setAuthCheckComplete(true);
    });
    
    return () => clearTimeout(authCheckTimeout);
  }, [checkAuthStatus]);
  
  // Failsafe for initial loading that never resolves
  useEffect(() => {
    const failsafeTimeout = setTimeout(() => {
      if (initialLoading) {
        debugLog('Failsafe triggered: forcing loading state to complete');
        setInitialLoading(false);
        setAuthCheckComplete(true);
      }
    }, 5000); // 5 second failsafe
    
    return () => clearTimeout(failsafeTimeout);
  }, [initialLoading]);
  
  useEffect(() => {
    if (!initialLoading && authCheckComplete && isAuthenticated) {
      debugLog('User is already authenticated, redirecting');
      
      const searchParams = new URLSearchParams(location.search);
      const returnTo = searchParams.get('returnTo');
      
      let destination = '/';
      
      if (returnTo && returnTo.startsWith('/')) {
        destination = returnTo;
      } else {
        destination = userType === 'client' ? '/client/dashboard' : '/developer/dashboard';
      }
      
      debugLog(`Redirecting authenticated user to: ${destination}`);
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, navigate, userType, location.search, initialLoading, authCheckComplete]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    
    if (searchParams.get('error') === 'email-verification' || error?.includes('verify')) {
      const emailToVerify = searchParams.get('email') || email;
      
      if (emailToVerify) {
        setVerificationEmail(emailToVerify);
        setShowVerification(true);
      }
    }
  }, [location.search, email, error]);
  
  // Add effect to handle OAuth errors
  useEffect(() => {
    if (oAuthError) {
      debugLog(`OAuth callback error detected: ${oAuthError}`);
    }
  }, [oAuthError]);
  
  const onResendVerification = async () => {
    try {
      await handleResendVerification();
      return true;
    } catch (error) {
      console.error('Error in resend verification:', error);
      return false;
    }
  };
  
  const onBackToLogin = () => {
    setShowVerification(false);
    const searchParams = new URLSearchParams(location.search);
    searchParams.delete('error');
    searchParams.delete('email');
    
    const newSearch = searchParams.toString();
    const path = location.pathname + (newSearch ? `?${newSearch}` : '');
    navigate(path, { replace: true });
  };
  
  if (showVerification) {
    return (
      <Layout>
        <LoginHeader />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto">
            <EmailVerificationMessage 
              email={verificationEmail}
              onResend={onResendVerification}
              onBack={onBackToLogin}
            />
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <LoginHeader />
      
      <div className="container mx-auto px-4 py-12">
        {(initialLoading || isProcessingOAuth) ? (
          <div className="max-w-md mx-auto space-y-4">
            <Skeleton className="h-8 w-full mb-4" />
            <Skeleton className="h-10 w-full mb-2" />
            <Skeleton className="h-10 w-full mb-4" />
            <Skeleton className="h-10 w-full" />
            <div className="text-center text-sm text-muted-foreground mt-4">
              {isProcessingOAuth ? "Processing your sign in..." : "Checking authentication status..."}
            </div>
          </div>
        ) : (
          <div className="max-w-md mx-auto">
            <LoginForm
              email={email}
              password={password}
              userType={userType}
              isLoading={isLoading}
              error={error || oAuthError || ''}
              emailError={emailError}
              passwordError={passwordError}
              rememberMe={rememberMe}
              onEmailChange={handleEmailChange}
              onPasswordChange={handlePasswordChange}
              onUserTypeChange={handleUserTypeChange}
              onRememberMeChange={handleRememberMeChange}
              onSubmit={handleSubmit}
              onEmailBlur={validateEmail}
              onPasswordBlur={validatePassword}
              onGoogleLogin={handleGoogleLogin}
              onGithubLogin={handleGithubLogin}
            />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default LoginPage;
