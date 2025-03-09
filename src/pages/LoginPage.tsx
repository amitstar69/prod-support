
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
      
      // If we're already authenticated, redirect to the appropriate dashboard
      if (data.session) {
        console.log('Session found, fetching profile to determine user type...');
        
        // Get user profile to determine user type
        supabase
          .from('profiles')
          .select('user_type')
          .eq('id', data.session.user.id)
          .maybeSingle()
          .then(({ data: profileData }) => {
            if (profileData) {
              console.log(`Profile found, user type: ${profileData.user_type}`);
              // Redirect based on user type
              const redirectPath = profileData.user_type === 'developer' ? '/profile' : '/client-dashboard';
              console.log(`Redirecting to ${redirectPath}`);
              navigate(redirectPath);
            } else {
              console.log('No profile found for this user');
            }
          })
          .catch(err => {
            console.error('Error fetching profile data:', err);
          });
      }
    });
    
    // Only run once on component mount
  }, [navigate]);
  
  // Handle redirect when authenticated via form submission
  useEffect(() => {
    if (isAuthenticated) {
      console.log('User is authenticated via form submission, redirecting to dashboard', { userType });
      
      const redirectPath = userType === 'developer' ? '/profile' : '/client-dashboard';
      console.log(`Redirecting to ${redirectPath}`);
      navigate(redirectPath);
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
