
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
  const [initialChecked, setInitialChecked] = useState(false);
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
    isAuthenticated,
    loginSuccess
  } = useLoginForm();
  
  // Track initial auth check to prevent flickering
  const [initialAuthCheckComplete, setInitialAuthCheckComplete] = useState(false);
  
  // Check auth status when component mounts
  useEffect(() => {
    let isMounted = true;
    
    const checkSession = async () => {
      console.log('[LoginPage] Checking auth status on mount...');
      
      try {
        // Debug: log any existing auth session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[LoginPage] Error checking session:', error);
          toast.error('Error checking authentication status');
          if (isMounted) {
            setInitialAuthCheckComplete(true);
            setInitialChecked(true);
          }
          return;
        }
        
        console.log('[LoginPage] Current Supabase session on login page load:', data.session);
        
        // If we're already authenticated, redirect to the appropriate dashboard
        if (data.session && !isRedirecting && isMounted) {
          console.log('[LoginPage] Session found, fetching profile to determine user type...');
          setIsRedirecting(true);
          
          // Get user profile to determine user type
          try {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('user_type')
              .eq('id', data.session.user.id)
              .maybeSingle();
              
            if (profileError) {
              console.error('[LoginPage] Error fetching profile data:', profileError);
              if (isMounted) {
                setIsRedirecting(false);
                setInitialAuthCheckComplete(true);
                setInitialChecked(true);
              }
              return;
            }
            
            if (profileData && isMounted) {
              console.log(`[LoginPage] Profile found, user type: ${profileData.user_type}`);
              
              // Redirect based on user type with a small delay to ensure state is updated
              const redirectPath = profileData.user_type === 'developer' ? '/profile' : '/client-dashboard';
              console.log(`[LoginPage] Redirecting to ${redirectPath}`);
              
              // Use a timeout to avoid immediate redirect which can cause flickering
              setTimeout(() => {
                if (isMounted) {
                  // Use window.location for a clean navigation that forces full page reload
                  window.location.href = redirectPath;
                }
              }, 500); // Slightly longer delay to ensure state updates
            } else {
              console.log('[LoginPage] No profile found for this user');
              if (isMounted) {
                setIsRedirecting(false);
                setInitialAuthCheckComplete(true);
                setInitialChecked(true);
              }
            }
          } catch (err) {
            console.error('[LoginPage] Error in profile check:', err);
            if (isMounted) {
              setIsRedirecting(false);
              setInitialAuthCheckComplete(true);
              setInitialChecked(true);
            }
          }
        } else {
          if (isMounted) {
            setInitialAuthCheckComplete(true);
            setInitialChecked(true);
          }
        }
      } catch (err) {
        console.error('[LoginPage] Error getting session:', err);
        if (isMounted) {
          setInitialAuthCheckComplete(true);
          setInitialChecked(true);
        }
      }
    };
    
    checkSession();
    
    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [navigate, isRedirecting]);
  
  // Handle redirect when authenticated via form submission
  useEffect(() => {
    if (loginSuccess && !isRedirecting && initialChecked) {
      console.log('[LoginPage] Login successful via form submission, redirecting to dashboard', { userType });
      setIsRedirecting(true);
      
      const redirectPath = userType === 'developer' ? '/profile' : '/client-dashboard';
      console.log(`[LoginPage] Redirecting to ${redirectPath}`);
      
      // Use direct navigation for a clean transition that forces a full page reload
      // This ensures a fresh state when reaching the destination page
      setTimeout(() => {
        window.location.href = redirectPath;
      }, 800); // Use a longer delay to ensure the login process completes
    }
  }, [loginSuccess, userType, navigate, isRedirecting, initialChecked]);
  
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
            isLoading={isLoading || isRedirecting}
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
