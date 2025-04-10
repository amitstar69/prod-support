
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
    validatePassword
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
      
      navigate(destination);
    }
  }, [isAuthenticated, navigate, userType, location.search]);
  
  console.log('LoginPage render state', { showVerification, isLoading, error });
  
  if (showVerification) {
    return (
      <Layout>
        <LoginHeader />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto">
            <EmailVerificationMessage email={verificationEmail} />
            <div className="mt-4 text-center">
              <button
                onClick={() => setShowVerification(false)}
                className="text-primary hover:underline text-sm"
              >
                Back to login
              </button>
            </div>
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
