
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { AuthState, AuthContextType } from './types';
import { checkSupabaseSession, setupAuthStateChangeListener, logoutUser } from './authUtils';
import { supabase } from '../../integrations/supabase/client';

// Create the auth context
export const AuthContext = createContext<AuthContextType>({
  authState: { isAuthenticated: false, userType: null, userId: null },
  setAuthState: () => {},
  logout: async () => {},
  login: async () => false,
  register: async () => false,
  isLoading: false
});

// AuthProvider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    userType: null,
    userId: null
  });
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    console.log('AuthProvider: Initializing auth state');
    
    try {
      // Load auth state from localStorage
      const storedAuthState = localStorage.getItem('authState');
      if (storedAuthState) {
        const parsedAuthState = JSON.parse(storedAuthState);
        console.log('AuthProvider: Loaded stored auth state:', parsedAuthState);
        setAuthState(parsedAuthState);
      } else {
        console.log('AuthProvider: No stored auth state found');
      }
      
      // Check Supabase session
      checkSupabaseSession(setAuthState)
        .then((supabaseAuthState) => {
          console.log('AuthProvider: Supabase session check result:', supabaseAuthState);
          setIsLoading(false);
        })
        .catch(error => {
          console.error('AuthProvider: Error checking Supabase session:', error);
          setIsLoading(false);
        });
      
      // Subscribe to auth state changes
      const subscription = setupAuthStateChangeListener(setAuthState);
      
      return () => {
        // Cleanup subscription on unmount
        if (subscription && typeof subscription.unsubscribe === 'function') {
          subscription.unsubscribe();
        }
      };
    } catch (error) {
      console.error('AuthProvider: Error in auth initialization:', error);
      setIsLoading(false);
    }
  }, []);
  
  // Log auth state changes
  useEffect(() => {
    console.log('AuthProvider: Auth state changed:', authState);
  }, [authState]);

  // Import or define login and register functions here
  const { login } = require('./authLogin');
  const { register: registerUser } = require('./authRegister');

  // Prepare context value
  const contextValue: AuthContextType = {
    authState,
    setAuthState,
    logout: logoutUser,
    login: (email, password, userType) => login(email, password, userType, setAuthState),
    register: (userData, userType) => registerUser(userData, userType, [], [], () => {}, () => {}, setAuthState),
    isLoading
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider as AuthStateProvider };
