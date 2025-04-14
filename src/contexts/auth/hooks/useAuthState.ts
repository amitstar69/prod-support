
import { useState, useEffect, useCallback } from 'react';
import { AuthState, AuthContextType } from '../types';
import { supabase } from '../../../integrations/supabase/client';
import { login } from '../authLogin';
import { register as authRegister } from '../authRegister';
import { logoutUser, checkSupabaseSession } from '../authUtils';

export const useAuthState = (): AuthContextType => {
  console.log('useAuthState initialized');
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    userType: null,
    userId: null,
  });
  
  const [isLoading, setIsLoading] = useState(true);
  
  // Initialize auth state from localStorage and Supabase session
  useEffect(() => {
    console.log('useAuthState - checking session on mount');
    
    const initializeAuthState = async () => {
      try {
        setIsLoading(true);
        
        // First try to load from localStorage for immediate UI feedback
        const storedAuthState = localStorage.getItem('authState');
        if (storedAuthState) {
          const parsedState = JSON.parse(storedAuthState);
          setAuthState(parsedState);
          console.log('Loaded initial auth state from localStorage:', parsedState);
        }
        
        // Then check with Supabase for the actual session status
        if (supabase) {
          const authData = await checkSupabaseSession(setAuthState);
          console.log('Supabase auth check result:', authData);
          
          // If we got a valid session from Supabase but localStorage had no data,
          // this would update our state with the valid session
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeAuthState();
    
    // Set up an auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`Auth state changed: ${event}`, session);
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            // Get the user type from the profiles table
            try {
              const { data: profileData } = await supabase
                .from('profiles')
                .select('user_type')
                .eq('id', session.user.id)
                .single();
                
              // Make sure the user_type is strictly 'developer' or 'client', or null
              const userType = profileData?.user_type === 'developer' ? 'developer' : 
                             profileData?.user_type === 'client' ? 'client' : null;
              
              const newAuthState: AuthState = {
                isAuthenticated: true,
                userId: session.user.id,
                userType: userType
              };
              
              setAuthState(newAuthState);
              localStorage.setItem('authState', JSON.stringify(newAuthState));
              console.log('Updated auth state from session change:', newAuthState);
            } catch (error) {
              console.error('Error fetching user type during auth change:', error);
            }
          }
        } else if (event === 'SIGNED_OUT') {
          setAuthState({
            isAuthenticated: false,
            userType: null,
            userId: null,
          });
          localStorage.removeItem('authState');
          console.log('Cleared auth state on sign out');
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  useEffect(() => {
    console.log('Auth state updated:', authState);
    
    if (authState.isAuthenticated) {
      localStorage.setItem('authState', JSON.stringify(authState));
    }
  }, [authState]);
  
  const handleLogout = useCallback(async () => {
    console.log("Logout triggered from AuthProvider");
    try {
      await logoutUser();
      setAuthState({
        isAuthenticated: false,
        userType: null,
        userId: null,
      });
      localStorage.removeItem('authState');
    } catch (error) {
      console.error("Error during logout:", error);
      setAuthState({
        isAuthenticated: false,
        userType: null,
        userId: null,
      });
      localStorage.removeItem('authState');
    }
  }, []);
  
  const handleLogin = useCallback(async (email: string, password: string, userType: 'developer' | 'client'): Promise<boolean> => {
    console.log('handleLogin called');
    setIsLoading(true);
    try {
      // Pass all required parameters with explicit defaults for optional parameters
      const result = await login(
        email, 
        password, 
        userType, 
        false, // rememberMe
        setAuthState, // setAuthState callback
        null, // redirectPath
        null // onSuccess
      );
      
      const isSuccessful = typeof result === 'boolean' 
        ? result 
        : (result && 'success' in result) ? result.success : false;
      
      if (isSuccessful) {
        setAuthState(prev => ({
          ...prev,
          isAuthenticated: true,
          userType: userType,
        }));
        console.log(`Login successful as ${userType}, setting auth state`);
      } else {
        const errorMessage = (typeof result === 'object' && result && 'error' in result) 
          ? result.error 
          : 'Login failed';
        console.error('Login failed:', errorMessage);
      }
      
      return isSuccessful;
    } catch (error: any) {
      console.error('Login exception:', error);
      return false;
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
    }
  }, []);
  
  const handleRegister = useCallback(async (userData: any, userType: 'developer' | 'client'): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Based on the registration function signature in contexts/auth/registration/index.ts
      // The function expects (userData, userType, mockDevelopers, mockClients, setMockDevelopers, setMockClients, setAuthState)
      const result = await authRegister(
        userData, 
        userType,
        [], // mockDevelopers - empty array as we're using Supabase
        [], // mockClients - empty array as we're using Supabase
        () => {}, // setMockDevelopers - empty function as we're using Supabase
        () => {}, // setMockClients - empty function as we're using Supabase
        setAuthState // setAuthState callback
      );
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    ...authState,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    logoutUser: handleLogout,
    isLoading,
  };
};
