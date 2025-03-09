
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthState, AuthContextType } from './types';
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from '../../integrations/supabase/client';
import { login } from './authLogin';
import { register } from './authRegister';
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
  const [mockDevelopers, setMockDevelopers] = useState<any[]>([]);
  const [mockClients, setMockClients] = useState<any[]>([]);
  
  // Load initial state from localStorage on mount and set up auth state listener
  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log('Initializing auth context...');
        
        // First load from localStorage as a fast initial state
        const storedAuthState = localStorage.getItem('authState');
        if (storedAuthState) {
          console.log('Found stored auth state in localStorage:', storedAuthState);
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
        
        // Then verify with Supabase (which is more reliable but slower)
        if (supabase) {
          console.log('Verifying auth state with Supabase...');
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
          
          // Set up auth state change listener
          console.log('Setting up auth state change listener...');
          const { subscription } = setupAuthStateChangeListener(setAuthState);
          
          return () => {
            // Clean up the subscription when the component unmounts
            console.log('Cleaning up auth state change listener...');
            subscription?.unsubscribe();
          };
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
        setAuthInitialized(true);
        console.log('Auth initialization complete.');
      }
    };
    
    initAuth();
  }, []);
  
  // Logout function that's passed to the context
  const handleLogout = async () => {
    console.log("Logout triggered from AuthProvider");
    try {
      await logoutUser();
      // Force auth state update in case the listener doesn't work
      setAuthState({
        isAuthenticated: false,
        userType: null,
        userId: null,
      });
      localStorage.removeItem('authState');
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
  
  // Update local storage whenever auth state changes
  useEffect(() => {
    if (authState.isAuthenticated) {
      console.log('Saving auth state to localStorage:', authState);
      localStorage.setItem('authState', JSON.stringify(authState));
    }
  }, [authState]);
  
  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login: (email, password, userType) => login(email, password, userType, mockDevelopers, mockClients, setAuthState),
        register: (userData, userType) => register(userData, userType, mockDevelopers, mockClients, setMockDevelopers, setMockClients, setAuthState),
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
