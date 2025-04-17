
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
  
  useEffect(() => {
    console.log('useAuthState - checking session on mount');
    
    const initializeAuthState = async () => {
      try {
        setIsLoading(true);
        
        const storedAuthState = localStorage.getItem('authState');
        if (storedAuthState) {
          try {
            const parsedState = JSON.parse(storedAuthState);
            
            let safeUserType: 'developer' | 'client' | null = null;
            if (parsedState.userType === 'developer') safeUserType = 'developer';
            else if (parsedState.userType === 'client') safeUserType = 'client';
            
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
        
        if (supabase) {
          const authData = await checkSupabaseSession(setAuthState);
          console.log('Supabase auth check result:', authData);
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeAuthState();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`Auth state changed: ${event}`, session);
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
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
  }, []);
  
  const handleLogin = useCallback(async (email: string, password: string, userType: 'developer' | 'client'): Promise<LoginResult> => {
    console.log('handleLogin called');
    setIsLoading(true);
    try {
      const result = await login(
        email, 
        password, 
        userType, 
        false,
        setAuthState,
        null,
        null
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
