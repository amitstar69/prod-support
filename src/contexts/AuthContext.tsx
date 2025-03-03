
import React, { createContext, useState, useContext, useEffect } from 'react';
import { AuthContextType, AuthState, Developer, Client } from '../types/product';
import { toast } from 'sonner';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize mock databases with an empty array that will be populated from localStorage
const defaultAuthState: AuthState = {
  isAuthenticated: false,
  userType: null,
  userId: null
};

const AuthContext = createContext<AuthContextType>({
  ...defaultAuthState,
  login: async () => false,
  register: async () => false, 
  logout: () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize mock data state within the component
  const [mockDevelopers, setMockDevelopers] = useState<Developer[]>([]);
  const [mockClients, setMockClients] = useState<Client[]>([]);
  
  const [authState, setAuthState] = useState<AuthState>(() => {
    // Load auth state from localStorage on initialization
    const savedState = localStorage.getItem('authState');
    return savedState ? JSON.parse(savedState) : defaultAuthState;
  });

  // Save auth state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('authState', JSON.stringify(authState));
  }, [authState]);

  // Initialize mock data on first load
  useEffect(() => {
    const savedDevelopers = localStorage.getItem('mockDevelopers');
    const savedClients = localStorage.getItem('mockClients');
    
    if (savedDevelopers) setMockDevelopers(JSON.parse(savedDevelopers));
    if (savedClients) setMockClients(JSON.parse(savedClients));
  }, []);

  // Check for existing Supabase session on load
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        // Get user metadata to determine user type
        const { data: userData } = await supabase.from('profiles').select('*').eq('id', data.session.user.id).single();
        
        if (userData) {
          setAuthState({
            isAuthenticated: true,
            userType: userData.user_type as 'developer' | 'client',
            userId: data.session.user.id
          });
        }
      }
    };
    
    if (supabaseUrl && supabaseKey) {
      checkSession();
    }
  }, []);

  const login = async (email: string, password: string, userType: 'developer' | 'client'): Promise<boolean> => {
    // If Supabase is configured, use it for authentication
    if (supabaseUrl && supabaseKey) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) {
          toast.error(error.message);
          return false;
        }
        
        if (data.user) {
          // Verify user type matches what they're trying to log in as
          const { data: profileData } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
          
          if (profileData && profileData.user_type === userType) {
            setAuthState({
              isAuthenticated: true,
              userType,
              userId: data.user.id
            });
            toast.success(`Logged in successfully as ${userType}`);
            return true;
          } else {
            toast.error(`This account is not registered as a ${userType}`);
            await supabase.auth.signOut();
            return false;
          }
        }
        
        return false;
      } catch (error) {
        console.error('Login error:', error);
        toast.error('Login failed');
        return false;
      }
    } else {
      // Fallback to localStorage authentication
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let user;
      if (userType === 'developer') {
        user = mockDevelopers.find(dev => dev.email === email);
      } else {
        user = mockClients.find(client => client.email === email);
      }
      
      // For demo purposes, we're not validating passwords
      if (user) {
        setAuthState({
          isAuthenticated: true,
          userType,
          userId: user.id
        });
        toast.success(`Logged in successfully as ${userType}`);
        return true;
      }
      
      toast.error('Invalid email or password');
      return false;
    }
  };

  const register = async (userData: Partial<Developer | Client>, userType: 'developer' | 'client'): Promise<boolean> => {
    // If Supabase is configured, use it for registration
    if (supabaseUrl && supabaseKey) {
      try {
        // Create user in Supabase auth
        const { data, error } = await supabase.auth.signUp({
          email: userData.email as string,
          password: (userData as any).password || 'defaultPassword123', // In a real app, you'd require a password
          options: {
            data: {
              user_type: userType
            }
          }
        });
        
        if (error) {
          toast.error(error.message);
          return false;
        }
        
        if (data.user) {
          // Add user profile to profiles table
          const profileData = {
            id: data.user.id,
            name: userData.name,
            email: userData.email,
            user_type: userType,
            ...userData
          };
          
          // Remove redundant/sensitive fields
          delete (profileData as any).password;
          
          const { error: profileError } = await supabase.from('profiles').insert(profileData);
          
          if (profileError) {
            toast.error(profileError.message);
            return false;
          }
          
          setAuthState({
            isAuthenticated: true,
            userType,
            userId: data.user.id
          });
          
          toast.success(`Registered successfully as ${userType}`);
          return true;
        }
        
        return false;
      } catch (error) {
        console.error("Registration error:", error);
        toast.error('Registration failed');
        return false;
      }
    } else {
      // Fallback to localStorage registration
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      try {
        const id = `user-${Date.now()}`;
        
        if (userType === 'developer') {
          const newDeveloper: Developer = {
            id,
            name: userData.name || 'Anonymous Developer',
            hourlyRate: (userData as Partial<Developer>).hourlyRate || 50,
            minuteRate: (userData as Partial<Developer>).minuteRate || 1,
            image: userData.image || 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1600&auto=format&fit=crop',
            category: (userData as Partial<Developer>).category || 'frontend',
            skills: (userData as Partial<Developer>).skills || ['JavaScript'],
            experience: (userData as Partial<Developer>).experience || '1+ years',
            description: userData.description || 'Developer profile',
            rating: 0,
            availability: true,
            online: false,
            lastActive: 'Just registered',
            email: userData.email || '',
            joinedDate: new Date().toISOString(),
            ...userData
          };
          
          // Update mockDevelopers state and localStorage
          const updatedDevelopers = [...mockDevelopers, newDeveloper];
          setMockDevelopers(updatedDevelopers);
          localStorage.setItem('mockDevelopers', JSON.stringify(updatedDevelopers));
          
        } else {
          const newClient: Client = {
            id,
            name: userData.name || 'Anonymous Client',
            email: userData.email || '',
            joinedDate: new Date().toISOString(),
            profileCompletionPercentage: 33,
            ...userData
          };
          
          // Update mockClients state and localStorage
          const updatedClients = [...mockClients, newClient];
          setMockClients(updatedClients);
          localStorage.setItem('mockClients', JSON.stringify(updatedClients));
        }
        
        // Auto-login after successful registration
        setAuthState({
          isAuthenticated: true,
          userType,
          userId: id
        });
        
        toast.success(`Registered successfully as ${userType}`);
        return true;
      } catch (error) {
        console.error("Registration error:", error);
        toast.error('Registration failed');
        return false;
      }
    }
  };

  const logout = async () => {
    if (supabaseUrl && supabaseKey) {
      await supabase.auth.signOut();
    }
    
    setAuthState(defaultAuthState);
    toast.info('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ 
      ...authState, 
      login, 
      register, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Helper functions for data access
export const getCurrentUserData = async () => {
  const { isAuthenticated, userType, userId } = JSON.parse(localStorage.getItem('authState') || '{}');
  
  if (!isAuthenticated || !userId) return null;
  
  if (supabaseUrl && supabaseKey) {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (error || !data) {
      console.error('Error fetching user data:', error);
      return null;
    }
    return data;
  } else {
    // Fallback to localStorage
    if (userType === 'developer') {
      const developers = JSON.parse(localStorage.getItem('mockDevelopers') || '[]');
      return developers.find((dev: Developer) => dev.id === userId);
    } else {
      const clients = JSON.parse(localStorage.getItem('mockClients') || '[]');
      return clients.find((client: Client) => client.id === userId);
    }
  }
};

export const updateUserData = async (userData: Partial<Developer | Client>) => {
  const { isAuthenticated, userType, userId } = JSON.parse(localStorage.getItem('authState') || '{}');
  
  if (!isAuthenticated || !userId) return false;
  
  if (supabaseUrl && supabaseKey) {
    const { error } = await supabase.from('profiles').update(userData).eq('id', userId);
    if (error) {
      console.error('Error updating user data:', error);
      return false;
    }
    return true;
  } else {
    // Fallback to localStorage
    if (userType === 'developer') {
      const developers = JSON.parse(localStorage.getItem('mockDevelopers') || '[]');
      const index = developers.findIndex((dev: Developer) => dev.id === userId);
      
      if (index !== -1) {
        developers[index] = { ...developers[index], ...userData };
        localStorage.setItem('mockDevelopers', JSON.stringify(developers));
        return true;
      }
    } else {
      const clients = JSON.parse(localStorage.getItem('mockClients') || '[]');
      const index = clients.findIndex((client: Client) => client.id === userId);
      
      if (index !== -1) {
        clients[index] = { ...clients[index], ...userData };
        localStorage.setItem('mockClients', JSON.stringify(clients));
        return true;
      }
    }
  }
  
  return false;
};

