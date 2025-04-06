
import { useState, useEffect, useCallback } from 'react';
import { AuthState, AuthContextType } from '../types';
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from '../../../integrations/supabase/client';
import { login as authLogin } from '../authLogin';
import { register as authRegister } from '../authRegister';
import { logoutUser, checkSupabaseSession, setupAuthStateChangeListener } from '../authUtils';

// Log Supabase configuration information
console.log('AuthContext: Supabase URL:', SUPABASE_URL ? 'URL is set' : 'URL is missing');
console.log('AuthContext: Supabase Key:', SUPABASE_ANON_KEY ? 'Key is set' : 'Key is missing');
console.log('AuthContext: Supabase Client:', supabase ? 'Client is initialized' : 'Client is not initialized');

export const useAuthState = (): AuthContextType => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    userType: null,
    userId: null,
  });
  
  const [authInitialized, setAuthInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mockDevelopers, setMockDevelopers] = useState<any[]>([]);
  const [mockClients, setMockClients] = useState<any[]>([]);
  
  const checkSession = useCallback(async () => {
    try {
      const storedAuthState = localStorage.getItem('authState');
      if (storedAuthState) {
        const parsedState = JSON.parse(storedAuthState);
        setAuthState(parsedState);
      }
      
      if (supabase) {
        const authData = await checkSupabaseSession(setAuthState);
        
        if (!authData?.isAuthenticated && storedAuthState) {
          const parsedState = JSON.parse(storedAuthState);
          if (parsedState.isAuthenticated) {
            console.log('Local auth state conflicts with server state. Resetting...');
            localStorage.removeItem('authState');
            setAuthState({
              isAuthenticated: false,
              userType: null,
              userId: null,
            });
          }
        }
      }
    } catch (error) {
      console.error('Error checking session:', error);
      localStorage.removeItem('authState');
      setAuthState({
        isAuthenticated: false,
        userType: null,
        userId: null,
      });
    } finally {
      setIsLoading(false);
      setAuthInitialized(true);
    }
  }, []);
  
  useEffect(() => {
    const initAuth = async () => {
      try {
        setIsLoading(true);
        
        const storedAuthState = localStorage.getItem('authState');
        if (storedAuthState) {
          const parsedState = JSON.parse(storedAuthState);
          setAuthState(parsedState);
        }
        
        const storedDevelopers = localStorage.getItem('mockDevelopers');
        if (storedDevelopers) {
          setMockDevelopers(JSON.parse(storedDevelopers));
        }
        
        const storedClients = localStorage.getItem('mockClients');
        if (storedClients) {
          setMockClients(JSON.parse(storedClients));
        }
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session check timeout')), 5000)
        );
        
        try {
          await Promise.race([checkSession(), timeoutPromise]);
        } catch (error) {
          console.warn('Session check timed out or failed:', error);
        }
        
        if (supabase) {
          setupAuthStateChangeListener(setAuthState);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        localStorage.removeItem('authState');
        setAuthState({
          isAuthenticated: false,
          userType: null,
          userId: null,
        });
      } finally {
        setIsLoading(false);
        setAuthInitialized(true);
      }
    };
    
    initAuth();
  }, [checkSession]);
  
  const handleLogout = async () => {
    console.log("Logout triggered from AuthProvider");
    try {
      await logoutUser();
    } catch (error) {
      console.error("Error during logout:", error);
      setAuthState({
        isAuthenticated: false,
        userType: null,
        userId: null,
      });
      localStorage.removeItem('authState');
    }
  };
  
  const handleLogin = async (email: string, password: string, userType: 'developer' | 'client'): Promise<boolean> => {
    setIsLoading(true);
    try {
      const loginAttemptTime = Date.now();
      localStorage.setItem('lastLoginAttempt', loginAttemptTime.toString());
      
      const timeoutPromise = new Promise<boolean>((_, reject) => {
        setTimeout(() => reject(new Error('Login request timed out')), 15000);
      });
      
      const loginPromise = authLogin(email, password, userType);
      
      const result = await Promise.race([loginPromise, timeoutPromise])
        .catch(error => {
          console.error('Login error or timeout in handleLogin:', error);
          return { success: false, error: error.message || 'Login timed out' };
        });
      
      const lastAttempt = localStorage.getItem('lastLoginAttempt');
      if (lastAttempt && parseInt(lastAttempt) !== loginAttemptTime) {
        console.log('Ignoring outdated login attempt response');
        return false;
      }
      
      const isSuccessful = typeof result === 'boolean' 
        ? result 
        : (result && 'success' in result) ? result.success : false;
      
      if (isSuccessful) {
        setAuthState(prev => ({
          ...prev,
          isAuthenticated: true,
          userType: userType,
        }));
        console.log(`Login successful as ${userType}, setting immediate auth state`);
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
  };
  
  const handleRegister = async (userData: any, userType: 'developer' | 'client'): Promise<boolean> => {
    setIsLoading(true);
    try {
      const result = await authRegister(
        userData, 
        userType,
        mockDevelopers,
        mockClients,
        setMockDevelopers,
        setMockClients,
        setAuthState
      );
      
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    ...authState,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    logoutUser: handleLogout,
    isLoading,
  };
};
