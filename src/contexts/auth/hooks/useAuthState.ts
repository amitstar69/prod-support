
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
  
  useEffect(() => {
    console.log('useAuthState - checking session on mount');
    const checkSession = async () => {
      try {
        const storedAuthState = localStorage.getItem('authState');
        if (storedAuthState) {
          const parsedState = JSON.parse(storedAuthState);
          setAuthState(parsedState);
          console.log('Loaded auth state from localStorage:', parsedState);
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
    
    checkSession();
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
      const result = await authRegister(userData, userType);
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
