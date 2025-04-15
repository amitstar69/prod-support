
import { useState, useEffect, useCallback } from 'react';
import { AuthState, AuthContextType } from '../types';
import { supabase } from '../../../integrations/supabase/client';
import { login, LoginResult } from '../authLogin';
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
          try {
            const parsedState = JSON.parse(storedAuthState);
            
            // Ensure userType is strictly typed as 'developer', 'client', or null
            let safeUserType: 'developer' | 'client' | null = null;
            if (parsedState.userType === 'developer') safeUserType = 'developer';
            else if (parsedState.userType === 'client') safeUserType = 'client';
            
            // Create a properly typed state object
            const safeState: AuthState = {
              isAuthenticated: !!parsedState.isAuthenticated,
              userId: parsedState.userId || null,
              userType: safeUserType
            };
            
            setAuthState(safeState);
            console.log('Loaded initial auth state from localStorage:', safeState);
          } catch (error) {
            console.error('Error parsing stored auth state:', error);
            localStorage.removeItem('authState');
          }
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
              const { data: profileData, error } = await supabase
                .from('profiles')
                .select('user_type')
                .eq('id', session.user.id)
                .single();
                
              if (error) {
                console.error('Error fetching user type:', error);
                return;
              }
                
              // Make sure the user_type is strictly 'developer' or 'client', or null
              let userType: 'developer' | 'client' | null = null;
              
              if (profileData?.user_type === 'developer') {
                userType = 'developer';
              } else if (profileData?.user_type === 'client') {
                userType = 'client';
              }
              
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
          const newState: AuthState = {
            isAuthenticated: false,
            userType: null,
            userId: null,
          };
          setAuthState(newState);
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
  
  const handleLogin = useCallback(async (email: string, password: string, userType: 'developer' | 'client'): Promise<LoginResult> => {
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
      
      if (result.success) {
        setAuthState(prev => ({
          ...prev,
          isAuthenticated: true,
          userType: userType,
        }));
        console.log(`Login successful as ${userType}, setting auth state`);
      } else {
        console.error('Login failed:', result.error);
      }
      
      return result;
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
