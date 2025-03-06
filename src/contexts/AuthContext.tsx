
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '@supabase/supabase-js';
import { AuthState, AuthContextType, Developer, Client } from '../types/product';
import { toast } from 'sonner';

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
          toast.error('Login failed: ' + error.message);
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
            toast.error('Profile not found. You may need to register first.');
            await supabase.auth.signOut();
            return false;
          }
          
          // Check if user type matches
          if (profileData.user_type !== userType) {
            console.error('User type mismatch');
            toast.error(`You registered as a ${profileData.user_type}, but tried to log in as a ${userType}.`);
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
  
  // Register function - updated to properly create database records
  const register = async (userData: Partial<Developer | Client>, userType: 'developer' | 'client'): Promise<boolean> => {
    // Try Supabase registration first
    if (supabase) {
      try {
        console.log('Registering with Supabase', {
          email: userData.email,
          userType,
          hasPassword: !!userData.password
        });
        
        // First create auth user
        const { data, error } = await supabase.auth.signUp({
          email: userData.email as string,
          password: userData.password as string,
        });
        
        if (error) {
          console.error('Supabase registration error:', error);
          toast.error('Registration failed: ' + error.message);
          // Fallback to localStorage registration
          return registerWithLocalStorage(userData, userType);
        }
        
        if (data.user) {
          console.log('User created in Auth system:', data.user.id);
          
          // Now create the profile record
          const profileData = {
            id: data.user.id,
            user_type: userType,
            name: userData.name || '',
            email: userData.email || '',
            image: userData.image || '/placeholder.svg',
            description: userData.description || '',
            location: userData.location || '',
            joined_date: new Date().toISOString(),
            languages: userData.languages || [],
            preferred_working_hours: userData.preferredWorkingHours || '',
            profile_completed: userData.profileCompleted || false,
            username: (userData as Client).username || null,
          };
          
          console.log('Creating profile record:', profileData);
          
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([profileData]);
          
          if (profileError) {
            console.error('Error creating profile:', profileError);
            toast.error('Error creating profile: ' + profileError.message);
            return false;
          }
          
          console.log('Profile created successfully');
          
          // Create type-specific profile record
          if (userType === 'developer') {
            const devData = userData as Partial<Developer>;
            const developerProfileData = {
              id: data.user.id,
              hourly_rate: devData.hourlyRate || 75,
              minute_rate: devData.minuteRate || null,
              category: devData.category || 'frontend',
              skills: devData.skills || ['JavaScript', 'React'],
              experience: devData.experience || '3 years',
              rating: devData.rating || 4.5,
              availability: devData.availability !== undefined ? devData.availability : true,
              featured: devData.featured || false,
              online: devData.online || false,
              last_active: new Date().toISOString(),
              phone: devData.phone || null,
              communication_preferences: devData.communicationPreferences || [],
            };
            
            console.log('Creating developer profile:', developerProfileData);
            
            const { error: devProfileError } = await supabase
              .from('developer_profiles')
              .insert([developerProfileData]);
            
            if (devProfileError) {
              console.error('Error creating developer profile:', devProfileError);
              toast.error('Error creating developer profile: ' + devProfileError.message);
              return false;
            }
            
            console.log('Developer profile created successfully');
          } else {
            const clientData = userData as Partial<Client>;
            const clientProfileData = {
              id: data.user.id,
              looking_for: clientData.lookingFor || [],
              completed_projects: clientData.completedProjects || 0,
              profile_completion_percentage: clientData.profileCompletionPercentage || 0,
              preferred_help_format: clientData.preferredHelpFormat || [],
              budget: clientData.budget || null,
              payment_method: clientData.paymentMethod || null,
              bio: clientData.bio || null,
              tech_stack: clientData.techStack || [],
              budget_per_hour: clientData.budgetPerHour || null,
              company: clientData.company || null,
              position: clientData.position || null,
              project_types: clientData.projectTypes || [],
              industry: clientData.industry || null,
              social_links: clientData.socialLinks || {},
              time_zone: clientData.timeZone || null,
              availability: clientData.availability || {},
              communication_preferences: clientData.communicationPreferences || []
            };
            
            console.log('Creating client profile:', clientProfileData);
            
            const { error: clientProfileError } = await supabase
              .from('client_profiles')
              .insert([clientProfileData]);
            
            if (clientProfileError) {
              console.error('Error creating client profile:', clientProfileError);
              toast.error('Error creating client profile: ' + clientProfileError.message);
              return false;
            }
            
            console.log('Client profile created successfully');
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
          
          console.log('Registration completed successfully');
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

// Function to get the current user's data - updated to work with the new schema
export const getCurrentUserData = async (): Promise<Developer | Client | null> => {
  const { isAuthenticated, userType, userId } = JSON.parse(localStorage.getItem('authState') || '{}');
  
  if (!isAuthenticated || !userId) return null;
  
  if (supabase && supabaseUrl && supabaseKey) {
    try {
      // First get the base profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (profileError) {
        console.error('Error fetching profile data from Supabase:', profileError);
        // Fall back to localStorage if Supabase fails
        return getUserDataFromLocalStorage(userType, userId);
      }
      
      // Get the type-specific profile data
      if (userType === 'developer') {
        const { data: devProfileData, error: devProfileError } = await supabase
          .from('developer_profiles')
          .select('*')
          .eq('id', userId)
          .single();
          
        if (devProfileError) {
          console.error('Error fetching developer profile data:', devProfileError);
          return getUserDataFromLocalStorage(userType, userId);
        }
        
        // Combine the data for a Developer
        return {
          ...profileData,
          ...devProfileData,
          // Handle naming differences between DB and TypeScript interfaces
          hourlyRate: devProfileData.hourly_rate,
          minuteRate: devProfileData.minute_rate,
          preferredWorkingHours: profileData.preferred_working_hours,
          lastActive: devProfileData.last_active,
          communicationPreferences: devProfileData.communication_preferences,
          profileCompleted: profileData.profile_completed
        } as Developer;
      } else {
        const { data: clientProfileData, error: clientProfileError } = await supabase
          .from('client_profiles')
          .select('*')
          .eq('id', userId)
          .single();
          
        if (clientProfileError) {
          console.error('Error fetching client profile data:', clientProfileError);
          return getUserDataFromLocalStorage(userType, userId);
        }
        
        // Combine the data for a Client
        return {
          ...profileData,
          ...clientProfileData,
          // Handle naming differences between DB and TypeScript interfaces
          lookingFor: clientProfileData.looking_for,
          completedProjects: clientProfileData.completed_projects,
          profileCompletionPercentage: clientProfileData.profile_completion_percentage,
          preferredWorkingHours: profileData.preferred_working_hours,
          profileCompleted: profileData.profile_completed,
          preferredHelpFormat: clientProfileData.preferred_help_format,
          budgetPerHour: clientProfileData.budget_per_hour,
          paymentMethod: clientProfileData.payment_method,
          techStack: clientProfileData.tech_stack,
          projectTypes: clientProfileData.project_types,
          socialLinks: clientProfileData.social_links,
          timeZone: clientProfileData.time_zone,
          communicationPreferences: clientProfileData.communication_preferences
        } as Client;
      }
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

// Function to update user data - updated to work with the new schema
export const updateUserData = async (userData: Partial<Developer | Client>): Promise<boolean> => {
  const { isAuthenticated, userType, userId } = JSON.parse(localStorage.getItem('authState') || '{}');
  
  if (!isAuthenticated || !userId) return false;
  
  if (supabase && supabaseUrl && supabaseKey) {
    try {
      // Separate profile data from type-specific data using type assertion and type guards
      const {
        // Properties that can only exist on Developer
        hourlyRate, minuteRate, category, skills, experience, rating, availability,
        featured, online, lastActive, communicationPreferences,
        // Properties that can only exist on Client
        lookingFor, completedProjects, profileCompletionPercentage, preferredHelpFormat,
        budget, paymentMethod, bio, techStack, budgetPerHour, company, position,
        projectTypes, industry, socialLinks, timeZone,
        // Common properties or ones we want to handle separately
        ...profileData
      } = userData as any; // Use type assertion to bypass TypeScript's type checking

      // Update the profiles table if there's data to update
      if (Object.keys(profileData).length > 0) {
        // Convert camelCase to snake_case for database fields
        const dbProfileData = {
          ...profileData,
          preferred_working_hours: profileData.preferredWorkingHours,
          profile_completed: profileData.profileCompleted,
        };
        
        delete dbProfileData.preferredWorkingHours;
        delete dbProfileData.profileCompleted;
        
        const { error: profileError } = await supabase
          .from('profiles')
          .update(dbProfileData)
          .eq('id', userId);
          
        if (profileError) {
          console.error('Error updating profile in Supabase:', profileError);
          return updateUserDataInLocalStorage(userType, userId, userData);
        }
      }
      
      // Update type-specific tables
      if (userType === 'developer') {
        const devUpdates: any = {};
        
        if (hourlyRate !== undefined) devUpdates.hourly_rate = hourlyRate;
        if (minuteRate !== undefined) devUpdates.minute_rate = minuteRate;
        if (category !== undefined) devUpdates.category = category;
        if (skills !== undefined) devUpdates.skills = skills;
        if (experience !== undefined) devUpdates.experience = experience;
        if (rating !== undefined) devUpdates.rating = rating;
        if (availability !== undefined) devUpdates.availability = availability;
        if (featured !== undefined) devUpdates.featured = featured;
        if (online !== undefined) devUpdates.online = online;
        if (lastActive !== undefined) devUpdates.last_active = lastActive;
        if (communicationPreferences !== undefined) devUpdates.communication_preferences = communicationPreferences;
        
        if (Object.keys(devUpdates).length > 0) {
          const { error: devError } = await supabase
            .from('developer_profiles')
            .update(devUpdates)
            .eq('id', userId);
            
          if (devError) {
            console.error('Error updating developer profile:', devError);
            return updateUserDataInLocalStorage(userType, userId, userData);
          }
        }
      } else if (userType === 'client') {
        const clientUpdates: any = {};
        
        if (lookingFor !== undefined) clientUpdates.looking_for = lookingFor;
        if (completedProjects !== undefined) clientUpdates.completed_projects = completedProjects;
        if (profileCompletionPercentage !== undefined) clientUpdates.profile_completion_percentage = profileCompletionPercentage;
        if (preferredHelpFormat !== undefined) clientUpdates.preferred_help_format = preferredHelpFormat;
        if (budget !== undefined) clientUpdates.budget = budget;
        if (paymentMethod !== undefined) clientUpdates.payment_method = paymentMethod;
        if (bio !== undefined) clientUpdates.bio = bio;
        if (techStack !== undefined) clientUpdates.tech_stack = techStack;
        if (budgetPerHour !== undefined) clientUpdates.budget_per_hour = budgetPerHour;
        if (company !== undefined) clientUpdates.company = company;
        if (position !== undefined) clientUpdates.position = position;
        if (projectTypes !== undefined) clientUpdates.project_types = projectTypes;
        if (industry !== undefined) clientUpdates.industry = industry;
        if (socialLinks !== undefined) clientUpdates.social_links = socialLinks;
        if (timeZone !== undefined) clientUpdates.time_zone = timeZone;
        if (availability !== undefined) clientUpdates.availability = availability;
        if (communicationPreferences !== undefined) clientUpdates.communication_preferences = communicationPreferences;
        
        if (Object.keys(clientUpdates).length > 0) {
          const { error: clientError } = await supabase
            .from('client_profiles')
            .update(clientUpdates)
            .eq('id', userId);
            
          if (clientError) {
            console.error('Error updating client profile:', clientError);
            return updateUserDataInLocalStorage(userType, userId, userData);
          }
        }
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
