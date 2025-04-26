
import { Dispatch, SetStateAction, useCallback } from 'react';
import { AuthState, UserType, OAuthProvider } from '../types';
import { login as authLogin, LoginResult } from '../authLogin';
import { loginWithOAuth as authLoginWithOAuth } from '../authOAuth';
import { register as authRegister } from '../authRegister';
import { logoutUser } from '../authUtils';
import { supabase } from '../../../integrations/supabase/client';

export const useAuthActions = (
  setAuthState: Dispatch<SetStateAction<AuthState>>,
  setIsLoading: Dispatch<SetStateAction<boolean>>
) => {
  const handleLogout = useCallback(async (): Promise<boolean> => {
    console.log("Logout triggered from AuthProvider");
    try {
      const result = await logoutUser();
      setAuthState({
        isAuthenticated: false,
        userType: null,
        userId: null,
      });
      localStorage.removeItem('authState');
      return result;
    } catch (error) {
      console.error("Error during logout:", error);
      setAuthState({
        isAuthenticated: false,
        userType: null,
        userId: null,
      });
      localStorage.removeItem('authState');
      return false;
    }
  }, [setAuthState]);
  
  const handleLogin = useCallback(async (
    email: string, 
    password: string, 
    userType: UserType,
    rememberMe: boolean = false
  ): Promise<LoginResult> => {
    console.log('handleLogin called with:', { email, userType, rememberMe });
    setIsLoading(true);
    try {
      // Use the actual Supabase authentication instead of the placeholder
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (signInError) {
        console.error('Sign in error:', signInError);
        return {
          success: false,
          error: signInError.message
        };
      }
      
      if (!signInData.user) {
        return {
          success: false,
          error: 'Failed to authenticate user'
        };
      }
      
      // Check if email is verified
      if (signInData.user.email_confirmed_at === null) {
        // Sign out if email not verified
        await supabase.auth.signOut();
        return {
          success: false,
          error: 'Please verify your email before logging in.',
          requiresVerification: true
        };
      }
      
      // Fetch user profile to check user type
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', signInData.user.id)
        .single();
        
      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return {
          success: false,
          error: 'Error verifying user type'
        };
      }
      
      // Check if user type matches
      if (profileData.user_type !== userType) {
        // Sign out if user type doesn't match
        await supabase.auth.signOut();
        return {
          success: false,
          error: `You are registered as a ${profileData.user_type}, not a ${userType}. Please use the correct login option.`
        };
      }
      
      // Update auth state
      setAuthState(prevState => ({
        ...prevState,
        isAuthenticated: true,
        userType: userType,
        userId: signInData.user?.id
      }));
      
      console.log(`Login successful as ${userType}, setting auth state`);
      return { success: true };
    } catch (error: any) {
      console.error('Login exception:', error);
      return {
        success: false,
        error: error.message || 'An unexpected error occurred during login'
      };
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
    }
  }, [setAuthState, setIsLoading]);
  
  const handleOAuthLogin = useCallback(async (
    provider: OAuthProvider,
    userType: UserType
  ): Promise<LoginResult> => {
    console.log(`handleOAuthLogin called for ${provider} as ${userType}`);
    setIsLoading(true);
    try {
      const result = await authLoginWithOAuth(provider, userType);
      
      if (result.success) {
        setAuthState(prev => ({
          ...prev,
          isAuthenticated: true,
          userType: userType,
        }));
        console.log(`OAuth login successful as ${userType}, setting auth state`);
      } else {
        console.error('OAuth login failed:', result.error);
      }
      
      return result;
    } catch (error: any) {
      console.error('OAuth login exception:', error);
      return {
        success: false,
        error: error.message || `An unexpected error occurred during ${provider} login`
      };
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
    }
  }, [setAuthState, setIsLoading]);
  
  const handleRegister = useCallback(async (
    userData: any, 
    userType: UserType
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const result = await authRegister(
        userData, 
        userType,
        [],
        [],
        () => {},
        () => {},
        setAuthState
      );
      return result;
    } finally {
      setIsLoading(false);
    }
  }, [setAuthState, setIsLoading]);

  return {
    handleLogin,
    handleOAuthLogin,
    handleRegister,
    handleLogout
  };
};
