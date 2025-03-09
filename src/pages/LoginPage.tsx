
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import LoginHeader from '../components/login/LoginHeader';
import LoginForm from '../components/login/LoginForm';
import { useLoginForm } from '../hooks/useLoginForm';
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';

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
  
  // Check auth status when component mounts
  useEffect(() => {
    // Debug: log any existing auth session
    supabase.auth.getSession().then(({ data, error }) => {
      console.log('Current Supabase session on login page load:', data.session);
      if (error) {
        console.error('Error checking session:', error);
        toast.error('Error checking authentication status');
      }
    });
    
    checkAuthStatus();
    
    // Also set up an interval to periodically check auth status
    // This helps detect successful logins via Supabase auth state change
    const intervalId = setInterval(() => {
      checkAuthStatus();
    }, 2000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Handle redirect when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log('User is authenticated, redirecting to dashboard', {userType});
      
      // Short delay to ensure state is consistent
      setTimeout(() => {
        if (userType === 'developer') {
          navigate('/profile');
        } else {
          navigate('/client-dashboard');
        }
      }, 300);
    }
  }, [isAuthenticated, userType, navigate]);
  
  return (
    <Layout>
      <LoginHeader />
      
      <div className="container mx-auto px-4 py-12">
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
      </div>
    </Layout>
  );
};

export default LoginPage;
