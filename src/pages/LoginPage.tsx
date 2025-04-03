
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import LoginHeader from '../components/login/LoginHeader';
import LoginForm from '../components/login/LoginForm';
import { useLoginForm } from '../hooks/useLoginForm';
import { Skeleton } from '../components/ui/skeleton';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    email, 
    password, 
    userType, 
    isLoading, 
    error, 
    rememberMe,
    handleEmailChange,
    handlePasswordChange,
    handleUserTypeChange,
    handleRememberMeChange,
    handleSubmit,
    checkAuthStatus,
    isAuthenticated
  } = useLoginForm();
  
  // Check auth status only once on initial component mount
  useEffect(() => {
    const checkAuth = async () => {
      console.log('Checking auth status on login page');
      await checkAuthStatus();
    };
    checkAuth();
  }, [checkAuthStatus]);
  
  // Add debug logging for render cycles
  console.log('LoginPage render cycle. Auth state:', { 
    isAuthenticated, 
    isLoading, 
    error,
    userType 
  });
  
  // Handle redirect for authenticated users
  useEffect(() => {
    if (isAuthenticated) {
      console.log('User is already authenticated, redirecting to home');
      const destination = userType === 'client' ? '/client-dashboard' : '/developer-dashboard';
      
      // Add a small delay to ensure state is fully updated
      setTimeout(() => {
        navigate(destination);
      }, 100);
    }
  }, [isAuthenticated, navigate, userType]);
  
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
              rememberMe={rememberMe}
              onEmailChange={handleEmailChange}
              onPasswordChange={handlePasswordChange}
              onUserTypeChange={handleUserTypeChange}
              onRememberMeChange={handleRememberMeChange}
              onSubmit={handleSubmit}
            />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default LoginPage;
