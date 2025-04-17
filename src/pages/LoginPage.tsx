
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import LoginHeader from '../components/login/LoginHeader';
import LoginForm from '../components/login/LoginForm';
import { useLoginForm } from '../hooks/useLoginForm';
import { Skeleton } from '../components/ui/skeleton';
import EmailVerificationMessage from '../components/auth/EmailVerificationMessage';

const LoginPage: React.FC = () => {
  console.log('LoginPage rendering');
  const navigate = useNavigate();
  const location = useLocation();
  const [showVerification, setShowVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  
  // Use the simplified version of useLoginForm to avoid circular dependencies
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
    checkAuthStatus,
    isAuthenticated,
    validateEmail,
    validatePassword,
    handleResendVerification
  } = useLoginForm();

  // Check URL query parameters for verification status
  useEffect(() => {
    console.log('LoginPage - checking URL params');
    const searchParams = new URLSearchParams(location.search);
    const verificationError = searchParams.get('error') === 'email-verification';
    const emailParam = searchParams.get('email');
    
    if (verificationError && emailParam) {
      setVerificationEmail(emailParam);
      setShowVerification(true);
    }
  }, [location.search]);
  
  // Check auth status only once on initial component mount
  useEffect(() => {
    console.log('LoginPage - checking auth status');
    checkAuthStatus();
  }, [checkAuthStatus]);
  
  // Handle redirect for authenticated users
  useEffect(() => {
    console.log('LoginPage - auth status effect', { isAuthenticated, userType });
    if (isAuthenticated) {
      console.log('User is already authenticated, redirecting');
      
      const searchParams = new URLSearchParams(location.search);
      const returnTo = searchParams.get('returnTo');
      
      let destination = '/';
      
      if (returnTo && returnTo.startsWith('/')) {
        destination = returnTo;
      } else {
        destination = userType === 'client' ? '/client-dashboard' : '/developer-dashboard';
      }
      
      console.log(`Redirecting authenticated user to: ${destination}`);
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, navigate, userType, location.search]);

  // Check for verification error in the URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    
    // If there's an error parameter that indicates email verification is needed
    if (searchParams.get('error') === 'email-verification' || error?.includes('verify')) {
      const emailToVerify = searchParams.get('email') || email;
      
      if (emailToVerify) {
        setVerificationEmail(emailToVerify);
        setShowVerification(true);
      }
    }
  }, [location.search, email, error]);
  
  // Handle resend verification and go back functions
  const onResendVerification = () => {
    handleResendVerification();
  };
  
  const onBackToLogin = () => {
    setShowVerification(false);
    // Clear verification related query params
    const searchParams = new URLSearchParams(location.search);
    searchParams.delete('error');
    searchParams.delete('email');
    
    const newSearch = searchParams.toString();
    const path = location.pathname + (newSearch ? `?${newSearch}` : '');
    navigate(path, { replace: true });
  };
  
  console.log('LoginPage render state', { showVerification, isLoading, error });
  
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
        {isLoading && !error && !email && !password ? (
          <div className="max-w-md mx-auto space-y-4">
            <Skeleton className="h-8 w-full mb-4" />
            <Skeleton className="h-10 w-full mb-2" />
            <Skeleton className="h-10 w-full mb-4" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <div className="max-w-md mx-auto">
            <LoginForm
              email={email}
              password={password}
              userType={userType}
              isLoading={isLoading}
              error={error}
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
            />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default LoginPage;
