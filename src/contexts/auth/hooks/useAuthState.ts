
import React, { useState, useEffect } from 'react';
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
  const [initializationFailed, setInitializationFailed] = useState(false);
  
  useEffect(() => {
    console.log('useAuthState - checking session on mount');
    console.time('auth-total-init');
    
    // Initialize auth state from localStorage and Supabase session
    const initialize = async () => {
      try {
        await initializeAuthState(setAuthState, setIsLoading);
      } catch (error) {
        console.error('Error initializing auth state:', error);
        setIsLoading(false);
        setInitializationFailed(true);
        
        // Set safe fallback state
        setAuthState({
          isAuthenticated: false,
          userType: null,
          userId: null,
        });
      } finally {
        console.timeEnd('auth-total-init');
      }
    };
    
    initialize();
    
    // Force loading state to finish after a maximum timeout - increased from 7s to 15s
    const forceLoadingTimeout = setTimeout(() => {
      if (isLoading) {
        console.warn('Auth state initialization force timeout reached after 15 seconds');
        setIsLoading(false);
        setInitializationFailed(true);
      }
    }, 15000); // Increased from 7s to 15s for slower connections
    
    // Set up auth state change listener
    const subscription = setupAuthStateChangeListener(setAuthState);
    
    return () => {
      subscription.unsubscribe();
      clearTimeout(forceLoadingTimeout);
    };
  }, []);
  
  useEffect(() => {
    console.log('Auth state updated:', authState);
    
    if (authState.isAuthenticated) {
      try {
        localStorage.setItem('authState', JSON.stringify(authState));
      } catch (error) {
        console.error('Error saving auth state to localStorage:', error);
      }
    }
  }, [authState]);
  
  // Get auth action handlers
  const { handleLogin, handleOAuthLogin, handleRegister, handleLogout } = useAuthActions(setAuthState, setIsLoading);

  return {
    ...authState,
    login: handleLogin,
    loginWithOAuth: handleOAuthLogin,
    register: handleRegister,
    logout: handleLogout,
    logoutUser: handleLogout,
    isLoading,
    initializationFailed,
  };
};
