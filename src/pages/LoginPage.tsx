
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import LoginHeader from '../components/login/LoginHeader';
import LoginForm from '../components/login/LoginForm';
import { useLoginForm } from '../hooks/useLoginForm';
import { Skeleton } from '../components/ui/skeleton';
import EmailVerificationMessage from '../components/auth/EmailVerificationMessage';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showVerification, setShowVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  
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
    validateEmail,
    validatePassword,
    handleSubmit,
    checkAuthStatus,
    isAuthenticated
  } = useLoginForm();

  // Check URL query parameters for verification status
  useEffect(() => {
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
    console.log('LoginPage mounting - checking auth status');
    const checkAuth = async () => {
      console.log('Checking auth status on login page');
      await checkAuthStatus();
    };
    checkAuth();
  }, [checkAuthStatus]);
  
  // Handle redirect for authenticated users
  useEffect(() => {
    if (isAuthenticated) {
      console.log('User is already authenticated, redirecting');
      
      // Determine where to redirect based on user type and optional returnTo param
      const searchParams = new URLSearchParams(location.search);
      const returnTo = searchParams.get('returnTo');
      
      let destination = '/';
      
      if (returnTo && returnTo.startsWith('/')) {
        destination = returnTo;
      } else {
        destination = userType === 'client' ? '/client-dashboard' : '/developer-dashboard';
      }
      
      // Add a small delay to ensure state is fully updated
      setTimeout(() => {
        navigate(destination);
      }, 100);
    }
  }, [isAuthenticated, navigate, userType, location.search]);
  
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
        {/* Use a skeleton loader while initially checking auth status */}
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
