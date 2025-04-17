
import { useState, useEffect } from 'react';
import { AuthState, AuthContextType } from '../types';
import { initializeAuthState } from './useAuthInitialization';
import { setupAuthStateChangeListener } from './useAuthStateChange';
import { useAuthActions } from './useAuthActions';

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
    
    // Initialize auth state from localStorage and Supabase session
    initializeAuthState(setAuthState, setIsLoading);
    
    // Set up auth state change listener
    const subscription = setupAuthStateChangeListener(setAuthState);
    
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
  
  // Get auth action handlers
  const { handleLogin, handleRegister, handleLogout } = useAuthActions(setAuthState, setIsLoading);

  return {
    ...authState,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    logoutUser: handleLogout,
    isLoading,
  };
};
