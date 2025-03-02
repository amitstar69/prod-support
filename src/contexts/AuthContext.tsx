
import React, { createContext, useState, useContext, useEffect } from 'react';
import { AuthContextType, AuthState, Developer, Client } from '../types/product';
import { toast } from 'sonner';

// Mock database of users
let mockDevelopers: Developer[] = [];
let mockClients: Client[] = [];

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
    
    if (savedDevelopers) mockDevelopers = JSON.parse(savedDevelopers);
    if (savedClients) mockClients = JSON.parse(savedClients);
  }, []);

  const login = async (email: string, password: string, userType: 'developer' | 'client'): Promise<boolean> => {
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
  };

  const register = async (userData: Partial<Developer | Client>, userType: 'developer' | 'client'): Promise<boolean> => {
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
        
        mockDevelopers.push(newDeveloper);
        localStorage.setItem('mockDevelopers', JSON.stringify(mockDevelopers));
        
      } else {
        const newClient: Client = {
          id,
          name: userData.name || 'Anonymous Client',
          email: userData.email || '',
          joinedDate: new Date().toISOString(),
          profileCompletionPercentage: 33,
          ...userData
        };
        
        mockClients.push(newClient);
        localStorage.setItem('mockClients', JSON.stringify(mockClients));
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
  };

  const logout = () => {
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
export const getCurrentUserData = () => {
  const { isAuthenticated, userType, userId } = JSON.parse(localStorage.getItem('authState') || '{}');
  
  if (!isAuthenticated || !userId) return null;
  
  if (userType === 'developer') {
    const developers = JSON.parse(localStorage.getItem('mockDevelopers') || '[]');
    return developers.find((dev: Developer) => dev.id === userId);
  } else {
    const clients = JSON.parse(localStorage.getItem('mockClients') || '[]');
    return clients.find((client: Client) => client.id === userId);
  }
};

export const updateUserData = (userData: Partial<Developer | Client>) => {
  const { isAuthenticated, userType, userId } = JSON.parse(localStorage.getItem('authState') || '{}');
  
  if (!isAuthenticated || !userId) return false;
  
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
  
  return false;
};
