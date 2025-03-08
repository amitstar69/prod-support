
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
  
  const [mockDevelopers, setMockDevelopers] = useState<any[]>([]);
  const [mockClients, setMockClients] = useState<any[]>([]);
  
  // Load initial state from localStorage on mount
  useEffect(() => {
    const storedAuthState = localStorage.getItem('authState');
    if (storedAuthState) {
      setAuthState(JSON.parse(storedAuthState));
    }
    
    const storedDevelopers = localStorage.getItem('mockDevelopers');
    if (storedDevelopers) {
      setMockDevelopers(JSON.parse(storedDevelopers));
    }
    
    const storedClients = localStorage.getItem('mockClients');
    if (storedClients) {
      setMockClients(JSON.parse(storedClients));
    }
    
    // Check Supabase session if available
    if (supabase) {
      checkSupabaseSession(setAuthState);
      
      // Listen for auth state changes
      const subscription = setupAuthStateChangeListener(setAuthState);
      
      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  // Logout function that's passed to the context
  const handleLogout = async () => {
    console.log("Logout triggered from AuthProvider");
    await logoutUser();
    // The state updates will be handled by the auth state change listener
  };
  
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
