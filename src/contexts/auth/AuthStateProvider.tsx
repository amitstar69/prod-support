
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
    let isMounted = true;
    let subscription: any = null;
    
    const initAuth = async () => {
      try {
        console.log('[AuthProvider] Initializing auth context...');
        
        // First check Supabase session directly - this is the single source of truth
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[AuthProvider] Error getting Supabase session:', error);
          if (isMounted) {
            setAuthState({
              isAuthenticated: false,
              userType: null,
              userId: null,
            });
            setAuthInitialized(true);
          }
          return;
        }
        
        if (data.session) {
          console.log('[AuthProvider] Found active Supabase session:', data.session.user.id);
          
          // Get user profile to determine user type
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('user_type')
            .eq('id', data.session.user.id)
            .maybeSingle();
            
          if (profileError) {
            console.error('[AuthProvider] Error getting profile:', profileError);
            if (isMounted) {
              setAuthState({
                isAuthenticated: true, // Still authenticated, just don't know the type
                userType: null,
                userId: data.session.user.id,
              });
            }
          } else if (profileData) {
            console.log('[AuthProvider] Found profile with user type:', profileData.user_type);
            if (isMounted) {
              setAuthState({
                isAuthenticated: true,
                userType: profileData.user_type as 'developer' | 'client',
                userId: data.session.user.id,
              });
            }
          } else {
            // Try to extract from user metadata as fallback
            const userType = data.session.user.user_metadata?.user_type as 'developer' | 'client' || null;
            console.log('[AuthProvider] No profile found, using metadata user type:', userType);
            
            if (isMounted) {
              setAuthState({
                isAuthenticated: true,
                userType: userType,
                userId: data.session.user.id,
              });
            }
          }
        } else {
          console.log('[AuthProvider] No active Supabase session');
          if (isMounted) {
            setAuthState({
              isAuthenticated: false,
              userType: null,
              userId: null,
            });
          }
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
        
        // Set up auth state change listener - this will handle future auth changes
        if (isMounted) {
          subscription = setupAuthStateChangeListener(setAuthState);
          setAuthInitialized(true);
          console.log('[AuthProvider] Auth initialization complete');
        }
      } catch (error) {
        console.error('[AuthProvider] Error initializing auth:', error);
        // Clear potentially corrupt auth state
        localStorage.removeItem('authState');
        if (isMounted) {
          setAuthState({
            isAuthenticated: false,
            userType: null,
            userId: null,
          });
          setAuthInitialized(true);
        }
      }
    };
    
    initAuth();
    
    // Cleanup function
    return () => {
      isMounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);
  
  // Logout function that's passed to the context
  const handleLogout = async () => {
    console.log("[AuthProvider] Logout triggered from AuthProvider");
    try {
      await logoutUser();
      // Force auth state update
      setAuthState({
        isAuthenticated: false,
        userType: null,
        userId: null,
      });
    } catch (error) {
      console.error("[AuthProvider] Error during logout:", error);
      // Force auth state update even on error
      setAuthState({
        isAuthenticated: false,
        userType: null,
        userId: null,
      });
    }
  };
  
  // Update local storage whenever auth state changes
  useEffect(() => {
    if (authState.isAuthenticated) {
      console.log('[AuthProvider] Saving auth state to localStorage:', authState);
      localStorage.setItem('authState', JSON.stringify(authState));
    } else if (localStorage.getItem('authState')) {
      console.log('[AuthProvider] Clearing auth state from localStorage');
      localStorage.removeItem('authState');
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
