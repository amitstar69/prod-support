
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
  const [isLoading, setIsLoading] = useState(true);
  const { 
    email, 
    password, 
    userType, 
    isLoading: isFormLoading, 
    error, 
    rememberMe,
    handleEmailChange,
    handlePasswordChange,
    handleUserTypeChange,
    handleRememberMeChange,
    handleSubmit,
    loginSuccess
  } = useLoginForm();
  
  // Check if already logged in on mount
  useEffect(() => {
    let isMounted = true;
    
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[LoginPage] Error checking session:', error);
          if (isMounted) setIsLoading(false);
          return;
        }
        
        if (!data.session) {
          console.log('[LoginPage] No active session found, showing login form');
          if (isMounted) setIsLoading(false);
          return;
        }
        
        console.log('[LoginPage] Active session found, checking profile');
        
        // Get user profile to determine where to redirect
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', data.session.user.id)
          .maybeSingle();
          
        if (profileError) {
          console.error('[LoginPage] Error fetching profile:', profileError);
          if (isMounted) setIsLoading(false);
          return;
        }
        
        if (!profileData) {
          console.log('[LoginPage] No profile found, staying on login page');
          if (isMounted) setIsLoading(false);
          return;
        }
        
        // We have a valid session and profile, redirect to appropriate dashboard
        console.log(`[LoginPage] User is logged in as ${profileData.user_type}, redirecting`);
        const redirectPath = profileData.user_type === 'developer' ? '/developer-dashboard' : '/client-dashboard';
        
        if (isMounted) {
          // Use navigate instead of window.location to avoid page reload
          navigate(redirectPath, { replace: true });
        }
      } catch (err) {
        console.error('[LoginPage] Error in session check:', err);
        if (isMounted) setIsLoading(false);
      }
    };
    
    checkSession();
    
    return () => {
      isMounted = false;
    };
  }, [navigate]);
  
  // Handle redirect after successful login
  useEffect(() => {
    if (loginSuccess) {
      console.log('[LoginPage] Login successful, redirecting to dashboard');
      
      // Get the return path from location state or default to the dashboard
      const state = location.state as { returnTo?: string } | null;
      const redirectPath = state?.returnTo || (userType === 'developer' ? '/developer-dashboard' : '/client-dashboard');
      
      console.log(`[LoginPage] Redirecting to: ${redirectPath}`);
      
      // Clear any previous toasts
      toast.dismiss();
      
      // Force the redirect using window.location for a full refresh
      window.location.href = redirectPath;
    }
  }, [loginSuccess, userType, navigate, location.state]);
  
  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-pulse text-center">
            <h2 className="text-2xl font-semibold mb-4">Checking authentication...</h2>
            <p className="text-gray-500">Please wait</p>
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
            isLoading={isFormLoading}
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
