
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthState, AuthContextType } from '../../types/product';
import { toast } from 'sonner';
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from '../../integrations/supabase/client';
import { login } from './authLogin';
import { register } from './authRegister';
import { getCurrentUserData, updateUserData } from './authProfileData';

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
      console.log('Checking Supabase session...');
      supabase.auth.getSession().then(({ data, error }) => {
        console.log('Supabase session result:', { data, error });
        if (data.session) {
          // Get user profile from Supabase
          console.log('User is authenticated, fetching profile for user:', data.session.user.id);
          supabase.from('profiles')
            .select('*')
            .eq('id', data.session.user.id)
            .single()
            .then(({ data: profileData, error: profileError }) => {
              console.log('Profile fetch result:', { profileData, profileError });
              if (profileData && !error) {
                // Fix type error by ensuring userType is 'developer' | 'client' | null
                const userType = profileData.user_type === 'developer' || profileData.user_type === 'client' 
                  ? profileData.user_type as 'developer' | 'client'
                  : null;
                
                setAuthState({
                  isAuthenticated: true,
                  userType: userType,
                  userId: data.session.user.id,
                });
                localStorage.setItem('authState', JSON.stringify({
                  isAuthenticated: true,
                  userType: userType,
                  userId: data.session.user.id,
                }));
              }
            });
        }
      });
      
      // Listen for auth state changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('Auth state changed:', event, 'Session:', session ? 'exists' : 'none');
          if (event === 'SIGNED_IN' && session) {
            // Get user profile
            const { data: profileData } = await supabase.from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
              
            if (profileData) {
              // Fix type error by ensuring userType is 'developer' | 'client' | null
              const userType = profileData.user_type === 'developer' || profileData.user_type === 'client' 
                ? profileData.user_type as 'developer' | 'client'
                : null;
                
              setAuthState({
                isAuthenticated: true,
                userType: userType,
                userId: session.user.id,
              });
              localStorage.setItem('authState', JSON.stringify({
                isAuthenticated: true,
                userType: userType,
                userId: session.user.id,
              }));
            }
          } else if (event === 'SIGNED_OUT') {
            setAuthState({
              isAuthenticated: false,
              userType: null,
              userId: null,
            });
            localStorage.removeItem('authState');
          }
        }
      );
      
      return () => {
        subscription.unsubscribe();
      };
    } else {
      console.error('Supabase client is not available. Authentication will not work properly.');
    }
  }, []);
  
  // Logout function - fixed to return a Promise
  const logout = async () => {
    console.log('Logging out user...');
    
    try {
      if (supabase) {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error('Error signing out from Supabase:', error);
          toast.error('Error signing out: ' + error.message);
        }
      }
      
      // Always clear local state regardless of Supabase result
      setAuthState({
        isAuthenticated: false,
        userType: null,
        userId: null,
      });
      localStorage.removeItem('authState');
      
      console.log('Logout completed, auth state cleared');
      toast.success('Successfully logged out');
      
    } catch (error) {
      console.error('Exception during logout:', error);
      toast.error('An error occurred during logout');
      
      // Still clear state on error
      setAuthState({
        isAuthenticated: false,
        userType: null,
        userId: null,
      });
      localStorage.removeItem('authState');
    }
  };
  
  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login: (email, password, userType) => login(email, password, userType, mockDevelopers, mockClients, setAuthState),
        register: (userData, userType) => register(userData, userType, mockDevelopers, mockClients, setMockDevelopers, setMockClients, setAuthState),
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Export utility functions
export { getCurrentUserData, updateUserData };
