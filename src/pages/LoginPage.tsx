
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import LoginHeader from '../components/login/LoginHeader';
import LoginForm from '../components/login/LoginForm';
import { useLoginForm } from '../hooks/useLoginForm';
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isRedirecting, setIsRedirecting] = useState(false);
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
  
  // Track initial auth check to prevent flickering
  const [initialAuthCheckComplete, setInitialAuthCheckComplete] = useState(false);
  
  // Check auth status when component mounts
  useEffect(() => {
    console.log('[LoginPage] Checking auth status on mount...');
    
    // Debug: log any existing auth session
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.error('[LoginPage] Error checking session:', error);
        toast.error('Error checking authentication status');
        setInitialAuthCheckComplete(true);
        return;
      }
      
      console.log('[LoginPage] Current Supabase session on login page load:', data.session);
      
      // If we're already authenticated, redirect to the appropriate dashboard
      if (data.session && !isRedirecting) {
        console.log('[LoginPage] Session found, fetching profile to determine user type...');
        setIsRedirecting(true);
        
        // Get user profile to determine user type
        supabase
          .from('profiles')
          .select('user_type')
          .eq('id', data.session.user.id)
          .maybeSingle()
          .then(({ data: profileData, error: profileError }) => {
            if (profileError) {
              console.error('[LoginPage] Error fetching profile data:', profileError);
              setIsRedirecting(false);
              setInitialAuthCheckComplete(true);
              return;
            }
            
            if (profileData) {
              console.log(`[LoginPage] Profile found, user type: ${profileData.user_type}`);
              
              // Redirect based on user type with a small delay to ensure state is updated
              const redirectPath = profileData.user_type === 'developer' ? '/profile' : '/client-dashboard';
              console.log(`[LoginPage] Redirecting to ${redirectPath}`);
              
              // Use a timeout to avoid immediate redirect which can cause flickering
              setTimeout(() => {
                navigate(redirectPath, { replace: true });
              }, 100);
            } else {
              console.log('[LoginPage] No profile found for this user');
              setIsRedirecting(false);
              setInitialAuthCheckComplete(true);
            }
          })
          .catch(err => {
            console.error('[LoginPage] Error fetching profile data:', err);
            setIsRedirecting(false);
            setInitialAuthCheckComplete(true);
          });
      } else {
        setInitialAuthCheckComplete(true);
      }
    }).catch(err => {
      console.error('[LoginPage] Error getting session:', err);
      setInitialAuthCheckComplete(true);
    });
    
    // Only run once on component mount
  }, [navigate]);
  
  // Handle redirect when authenticated via form submission
  useEffect(() => {
    if (isAuthenticated && !isRedirecting) {
      console.log('[LoginPage] User is authenticated via form submission, redirecting to dashboard', { userType });
      setIsRedirecting(true);
      
      const redirectPath = userType === 'developer' ? '/profile' : '/client-dashboard';
      console.log(`[LoginPage] Redirecting to ${redirectPath}`);
      
      // Use window.location for a full page navigation to avoid React Router issues
      window.location.href = redirectPath;
    }
  }, [isAuthenticated, userType, navigate, isRedirecting]);
  
  // Check for returnTo parameter in location state
  const returnTo = location.state?.returnTo || '/';
  
  if (!initialAuthCheckComplete) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-pulse text-center">
            <h2 className="text-2xl font-semibold mb-4">Checking authentication...</h2>
            <p className="text-gray-500">Please wait while we verify your session</p>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <LoginHeader />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
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
