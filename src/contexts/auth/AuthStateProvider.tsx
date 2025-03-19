
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { AuthState, AuthContextType } from './types';
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from '../../integrations/supabase/client';
import { login as authLogin } from './authLogin';
import { register as authRegister } from './authRegister';
import { logoutUser, checkSupabaseSession, setupAuthStateChangeListener } from './authUtils';

// Log Supabase configuration information
console.log('AuthContext: Supabase URL:', SUPABASE_URL ? 'URL is set' : 'URL is missing');
console.log('AuthContext: Supabase Key:', SUPABASE_ANON_KEY ? 'Key is set' : 'Key is missing');
console.log('AuthContext: Supabase Client:', supabase ? 'Client is initialized' : 'Client is not initialized');

// Create the auth context
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  userType: null,
  userId: null,
  login: async () => false,
  register: async () => false,
  logout: async () => {},
  logoutUser: async () => {},
  isLoading: true, // Add loading state
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component to wrap the app
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    userType: null,
    userId: null,
  });
  
  const [authInitialized, setAuthInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const [mockDevelopers, setMockDevelopers] = useState<any[]>([]);
  const [mockClients, setMockClients] = useState<any[]>([]);
  
  // Memoize checkSupabaseSession with useCallback to avoid recreating the function on each render
  const checkSession = useCallback(async () => {
    try {
      // First load from localStorage as a fast initial state (this is synchronous)
      const storedAuthState = localStorage.getItem('authState');
      if (storedAuthState) {
        const parsedState = JSON.parse(storedAuthState);
        setAuthState(parsedState);
      }
      
      // Then verify with Supabase (which is more reliable but slower)
      if (supabase) {
        const authData = await checkSupabaseSession(setAuthState);
        
        // If the server indicates we're not authenticated but local storage did,
        // clear the local storage to prevent stale authentication
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
      // Clear potentially corrupt auth state
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
  
  // Load initial state from localStorage on mount and set up auth state listener
  useEffect(() => {
    const initAuth = async () => {
      try {
        setIsLoading(true);
        
        // Load from localStorage first (fast)
        const storedAuthState = localStorage.getItem('authState');
        if (storedAuthState) {
          const parsedState = JSON.parse(storedAuthState);
          setAuthState(parsedState);
        }
        
        // Load mock data if needed
        const storedDevelopers = localStorage.getItem('mockDevelopers');
        if (storedDevelopers) {
          setMockDevelopers(JSON.parse(storedDevelopers));
        }
        
        const storedClients = localStorage.getItem('mockClients');
        if (storedClients) {
          setMockClients(JSON.parse(storedClients));
        }
        
        // Verify with Supabase (slower but more reliable)
        // Use a timeout to prevent hanging on this request
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session check timeout')), 5000)
        );
        
        try {
          await Promise.race([checkSession(), timeoutPromise]);
        } catch (error) {
          console.warn('Session check timed out or failed:', error);
          // We'll proceed with the localStorage state and recheck later
        }
        
        // Set up auth state change listener
        if (supabase) {
          setupAuthStateChangeListener(setAuthState);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Clear potentially corrupt auth state
        localStorage.removeItem('authState');
        setAuthState({
          isAuthenticated: false,
          userType: null,
          userId: null,
        });
      } finally {
        // Mark auth as initialized even if there was an error
        setIsLoading(false);
        setAuthInitialized(true);
      }
    };
    
    initAuth();
    
    // Cleanup function not needed here since subscription is handled in checkSupabaseSession
  }, [checkSession]);
  
  // Logout function that's passed to the context
  const handleLogout = async () => {
    console.log("Logout triggered from AuthProvider");
    try {
      await logoutUser();
      // The state updates will be handled by the auth state change listener
    } catch (error) {
      console.error("Error during logout:", error);
      // Force auth state update in case the listener doesn't work
      setAuthState({
        isAuthenticated: false,
        userType: null,
        userId: null,
      });
      localStorage.removeItem('authState');
    }
  };
  
  // Login handler function with improved performance
  const handleLogin = async (email: string, password: string, userType: 'developer' | 'client'): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Store the login attempt timestamp to help with race conditions
      const loginAttemptTime = Date.now();
      localStorage.setItem('lastLoginAttempt', loginAttemptTime.toString());
      
      // Perform login
      const result = await authLogin(email, password, userType);
      
      // Check if this is still the most recent login attempt
      const lastAttempt = localStorage.getItem('lastLoginAttempt');
      if (lastAttempt && parseInt(lastAttempt) !== loginAttemptTime) {
        console.log('Ignoring outdated login attempt response');
        return false;
      }
      
      // Update auth state immediately on successful login to speed up UI response
      if (result.success) {
        // We'll let the auth listener handle the state update for consistency
        // but we can immediately set isAuthenticated to true for UI purposes
        setAuthState(prev => ({
          ...prev,
          isAuthenticated: true,
        }));
      }
      
      return result.success;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Register handler function
  const handleRegister = async (userData: any, userType: 'developer' | 'client'): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Pass all required arguments to the authRegister function
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
  
  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
        logoutUser: handleLogout, // Use the same handler for both methods
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
