import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '@supabase/supabase-js';
import { AuthState, AuthContextType, Developer, Client } from '../types/product';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

// Create the auth context
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  userType: null,
  userId: null,
  login: async () => false,
  register: async () => false,
  logout: () => {},
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
  
  const [mockDevelopers, setMockDevelopers] = useState<Developer[]>([]);
  const [mockClients, setMockClients] = useState<Client[]>([]);
  
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
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) {
          // Get user profile from Supabase
          supabase.from('profiles')
            .select('*')
            .eq('id', data.session.user.id)
            .single()
            .then(({ data: profileData, error }) => {
              if (profileData && !error) {
                setAuthState({
                  isAuthenticated: true,
                  userType: profileData.user_type,
                  userId: data.session.user.id,
                });
                localStorage.setItem('authState', JSON.stringify({
                  isAuthenticated: true,
                  userType: profileData.user_type,
                  userId: data.session.user.id,
                }));
              }
            });
        }
      });
      
      // Listen for auth state changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (event === 'SIGNED_IN' && session) {
            // Get user profile
            const { data: profileData } = await supabase.from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
              
            if (profileData) {
              setAuthState({
                isAuthenticated: true,
                userType: profileData.user_type,
                userId: session.user.id,
              });
              localStorage.setItem('authState', JSON.stringify({
                isAuthenticated: true,
                userType: profileData.user_type,
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
    }
  }, []);
  
  // Login function
  const login = async (email: string, password: string, userType: 'developer' | 'client'): Promise<boolean> => {
    // Try Supabase login first
    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          console.error('Supabase login error:', error);
          // Fallback to localStorage login if Supabase fails
          return loginWithLocalStorage(email, password, userType);
        }
        
        if (data.user) {
          // Get user profile to determine user type
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();
            
          if (profileError || !profileData) {
            console.error('Error getting profile:', profileError);
            return false;
          }
          
          // Check if user type matches
          if (profileData.user_type !== userType) {
            console.error('User type mismatch');
            await supabase.auth.signOut();
            return false;
          }
          
          setAuthState({
            isAuthenticated: true,
            userType: profileData.user_type,
            userId: data.user.id,
          });
          
          localStorage.setItem('authState', JSON.stringify({
            isAuthenticated: true,
            userType: profileData.user_type,
            userId: data.user.id,
          }));
          
          return true;
        }
        return false;
      } catch (error) {
        console.error('Supabase login exception:', error);
        // Fallback to localStorage login
        return loginWithLocalStorage(email, password, userType);
      }
    } else {
      // Use localStorage login as fallback
      return loginWithLocalStorage(email, password, userType);
    }
  };
  
  // Helper for localStorage login
  const loginWithLocalStorage = (email: string, password: string, userType: 'developer' | 'client'): boolean => {
    if (userType === 'developer') {
      const developer = mockDevelopers.find(dev => dev.email === email);
      if (developer) {
        setAuthState({
          isAuthenticated: true,
          userType: 'developer',
          userId: developer.id,
        });
        localStorage.setItem('authState', JSON.stringify({
          isAuthenticated: true,
          userType: 'developer',
          userId: developer.id,
        }));
        return true;
      }
    } else {
      const client = mockClients.find(c => c.email === email);
      if (client) {
        setAuthState({
          isAuthenticated: true,
          userType: 'client',
          userId: client.id,
        });
        localStorage.setItem('authState', JSON.stringify({
          isAuthenticated: true,
          userType: 'client',
          userId: client.id,
        }));
        return true;
      }
    }
    return false;
  };
  
  // Register function
  const register = async (userData: Partial<Developer | Client>, userType: 'developer' | 'client'): Promise<boolean> => {
    // Try Supabase registration first
    if (supabase) {
      try {
        // First create auth user
        const { data, error } = await supabase.auth.signUp({
          email: userData.email as string,
          password: 'password123', // Set a default password - in a real app, this would come from user input
        });
        
        if (error) {
          console.error('Supabase registration error:', error);
          // Fallback to localStorage registration
          return registerWithLocalStorage(userData, userType);
        }
        
        if (data.user) {
          // Now create the profile
          const { error: profileError } = await supabase.from('profiles').insert({
            id: data.user.id,
            user_type: userType,
            ...userData,
          });
          
          if (profileError) {
            console.error('Error creating profile:', profileError);
            return false;
          }
          
          setAuthState({
            isAuthenticated: true,
            userType,
            userId: data.user.id,
          });
          
          localStorage.setItem('authState', JSON.stringify({
            isAuthenticated: true,
            userType,
            userId: data.user.id,
          }));
          
          return true;
        }
        return false;
      } catch (error) {
        console.error('Supabase registration exception:', error);
        // Fallback to localStorage registration
        return registerWithLocalStorage(userData, userType);
      }
    } else {
      // Use localStorage registration as fallback
      return registerWithLocalStorage(userData, userType);
    }
  };
  
  // Helper for localStorage registration
  const registerWithLocalStorage = (userData: Partial<Developer | Client>, userType: 'developer' | 'client'): boolean => {
    try {
      if (userType === 'developer') {
        const developerData = userData as Partial<Developer>;
        
        const newDev = {
          id: `dev-${Date.now()}`,
          name: developerData.name || '',
          hourlyRate: 75,
          image: '/placeholder.svg',
          category: developerData.category || 'frontend',
          skills: developerData.skills || ['JavaScript', 'React'],
          experience: developerData.experience || '3 years',
          description: developerData.description || '',
          rating: 4.5,
          availability: true,
          email: developerData.email,
          ...developerData,
        } as Developer;
        
        const updatedDevelopers = [...mockDevelopers, newDev];
        setMockDevelopers(updatedDevelopers);
        localStorage.setItem('mockDevelopers', JSON.stringify(updatedDevelopers));
        
        setAuthState({
          isAuthenticated: true,
          userType: 'developer',
          userId: newDev.id,
        });
        
        localStorage.setItem('authState', JSON.stringify({
          isAuthenticated: true,
          userType: 'developer',
          userId: newDev.id,
        }));
        
        return true;
      } else {
        const clientData = userData as Partial<Client>;
        
        const newClient = {
          id: `client-${Date.now()}`,
          name: clientData.name || '',
          email: clientData.email || '',
          joinedDate: new Date().toISOString(),
          ...clientData,
        } as Client;
        
        const updatedClients = [...mockClients, newClient];
        setMockClients(updatedClients);
        localStorage.setItem('mockClients', JSON.stringify(updatedClients));
        
        setAuthState({
          isAuthenticated: true,
          userType: 'client',
          userId: newClient.id,
        });
        
        localStorage.setItem('authState', JSON.stringify({
          isAuthenticated: true,
          userType: 'client',
          userId: newClient.id,
        }));
        
        return true;
      }
    } catch (error) {
      console.error('LocalStorage registration error:', error);
      return false;
    }
  };
  
  // Logout function
  const logout = () => {
    if (supabase) {
      supabase.auth.signOut().then(() => {
        setAuthState({
          isAuthenticated: false,
          userType: null,
          userId: null,
        });
        localStorage.removeItem('authState');
      });
    } else {
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
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Function to get the current user's data
export const getCurrentUserData = async (): Promise<Developer | Client | null> => {
  const { isAuthenticated, userType, userId } = JSON.parse(localStorage.getItem('authState') || '{}');
  
  if (!isAuthenticated || !userId) return null;
  
  if (supabase && supabaseUrl && supabaseKey) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error('Error fetching user data from Supabase:', error);
        // Fall back to localStorage if Supabase fails
        return getUserDataFromLocalStorage(userType, userId);
      }
      
      return data as (Developer | Client);
    } catch (error) {
      console.error('Exception fetching user data from Supabase:', error);
      // Fall back to localStorage
      return getUserDataFromLocalStorage(userType, userId);
    }
  } else {
    // Use localStorage as fallback
    return getUserDataFromLocalStorage(userType, userId);
  }
};

// Helper to get user data from localStorage
const getUserDataFromLocalStorage = (userType: string | null, userId: string | null): Developer | Client | null => {
  if (userType === 'developer') {
    const developers = JSON.parse(localStorage.getItem('mockDevelopers') || '[]');
    return developers.find((dev: Developer) => dev.id === userId) || null;
  } else if (userType === 'client') {
    const clients = JSON.parse(localStorage.getItem('mockClients') || '[]');
    return clients.find((client: Client) => client.id === userId) || null;
  }
  return null;
};

// Function to update user data
export const updateUserData = async (userData: Partial<Developer | Client>): Promise<boolean> => {
  const { isAuthenticated, userType, userId } = JSON.parse(localStorage.getItem('authState') || '{}');
  
  if (!isAuthenticated || !userId) return false;
  
  if (supabase && supabaseUrl && supabaseKey) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(userData)
        .eq('id', userId);
        
      if (error) {
        console.error('Error updating user data in Supabase:', error);
        // Fallback to localStorage
        return updateUserDataInLocalStorage(userType, userId, userData);
      }
      
      return true;
    } catch (error) {
      console.error('Exception updating user data in Supabase:', error);
      // Fallback to localStorage
      return updateUserDataInLocalStorage(userType, userId, userData);
    }
  } else {
    // Fallback to localStorage
    return updateUserDataInLocalStorage(userType, userId, userData);
  }
};

// Helper to update user data in localStorage
const updateUserDataInLocalStorage = (
  userType: string | null, 
  userId: string | null, 
  userData: Partial<Developer | Client>
): boolean => {
  if (userType === 'developer') {
    const developers = JSON.parse(localStorage.getItem('mockDevelopers') || '[]');
    const index = developers.findIndex((dev: Developer) => dev.id === userId);
    
    if (index !== -1) {
      developers[index] = { ...developers[index], ...userData };
      localStorage.setItem('mockDevelopers', JSON.stringify(developers));
      return true;
    }
  } else if (userType === 'client') {
    const clients = JSON.parse(localStorage.getItem('mockClients') || '[]');
    const index = clients.findIndex((client: Client) => client.id === userId);
    
    if (index !== -1) {
      clients[index] = { ...clients[index], ...userData };
      localStorage.setItem('mockClients', JSON.stringify(clients));
      return true;
    }
  }
  
  return false;
};
