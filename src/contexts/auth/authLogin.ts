
import { supabase } from '../../integrations/supabase/client';
import { toast } from 'sonner';
import { Developer, Client } from '../../types/product';
import { Dispatch, SetStateAction } from 'react';
import { AuthState } from '../../types/product';

// Login function
export const login = async (
  email: string, 
  password: string, 
  userType: 'developer' | 'client',
  mockDevelopers: Developer[],
  mockClients: Client[],
  setAuthState: Dispatch<SetStateAction<AuthState>>
): Promise<boolean> => {
  // Try Supabase login first
  if (supabase) {
    try {
      console.log(`Attempting to login user: ${email} as ${userType}`);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Supabase login error:', error);
        toast.error('Login failed: ' + error.message);
        // Fallback to localStorage login if Supabase fails
        return loginWithLocalStorage(email, password, userType, mockDevelopers, mockClients, setAuthState);
      }
      
      if (!data.user) {
        console.error('No user data returned from Supabase');
        toast.error('Login failed: No user data returned');
        return false;
      }
      
      console.log('Login successful, user data:', data);
      
      // Get user profile to determine user type
      try {
        // Check if profile exists for this user
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle();
          
        if (profileError) {
          console.error('Error getting profile:', profileError);
          toast.error('Error retrieving user profile');
          return false;
        }
        
        if (!profileData) {
          console.log('Profile not found, creating new profile');
          
          // Create a new profile for this user since one doesn't exist
          const { error: createError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              user_type: userType,
              email: email,
              name: email.split('@')[0], // Use part of email as temporary name
              profile_completed: false
            });
            
          if (createError) {
            console.error('Error creating profile:', createError);
            toast.error('Could not create user profile');
            return false;
          }
          
          // Create type-specific profile
          if (userType === 'developer') {
            const { error: devProfileError } = await supabase
              .from('developer_profiles')
              .insert({
                id: data.user.id,
                hourly_rate: 75,
                minute_rate: 1.25,
                skills: ['JavaScript', 'React'],
                availability: true
              });
              
            if (devProfileError) {
              console.error('Error creating developer profile:', devProfileError);
              // Continue anyway as the base profile was created
            }
          } else {
            const { error: clientProfileError } = await supabase
              .from('client_profiles')
              .insert({
                id: data.user.id,
                budget_per_hour: 75,
                preferred_help_format: ['chat'],
                looking_for: ['web development']
              });
              
            if (clientProfileError) {
              console.error('Error creating client profile:', clientProfileError);
              // Continue anyway as the base profile was created
            }
          }
          
          // Set auth state with new profile
          setAuthState({
            isAuthenticated: true,
            userType: userType,
            userId: data.user.id,
          });
          
          localStorage.setItem('authState', JSON.stringify({
            isAuthenticated: true,
            userType: userType,
            userId: data.user.id,
          }));
          
          toast.success('Welcome! Your profile has been created.');
          return true;
        }
        
        // Profile exists, check if user type matches
        if (profileData.user_type !== userType) {
          console.error('User type mismatch');
          toast.error(`You registered as a ${profileData.user_type}, but tried to log in as a ${userType}.`);
          return false;
        }
        
        // Set auth state with existing profile
        setAuthState({
          isAuthenticated: true,
          userType: profileData.user_type as 'developer' | 'client',
          userId: data.user.id,
        });
        
        localStorage.setItem('authState', JSON.stringify({
          isAuthenticated: true,
          userType: profileData.user_type as 'developer' | 'client',
          userId: data.user.id,
        }));
        
        toast.success(`Login successful! Welcome back.`);
        return true;
      } catch (profileException) {
        console.error('Exception during profile fetch:', profileException);
        toast.error('Error processing login. Please try again.');
        return false;
      }
    } catch (error) {
      console.error('Supabase login exception:', error);
      toast.error('Login service unavailable. Please try again later.');
      // Fallback to localStorage login
      return loginWithLocalStorage(email, password, userType, mockDevelopers, mockClients, setAuthState);
    }
  } else {
    console.error('Supabase client is not available. Falling back to localStorage login.');
    // Use localStorage login as fallback
    return loginWithLocalStorage(email, password, userType, mockDevelopers, mockClients, setAuthState);
  }
};

// Helper for localStorage login (for development or fallback)
const loginWithLocalStorage = (
  email: string, 
  password: string, 
  userType: 'developer' | 'client',
  mockDevelopers: Developer[],
  mockClients: Client[],
  setAuthState: Dispatch<SetStateAction<AuthState>>
): boolean => {
  console.log(`Attempting localStorage login for: ${email} as ${userType}`);
  
  // For demo purposes, we'll consider any email/password valid in the mock data
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
      toast.success('Logged in with mock developer account');
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
      toast.success('Logged in with mock client account');
      return true;
    }
  }
  
  console.error(`No matching ${userType} found for email: ${email}`);
  toast.error(`Invalid email or password for ${userType} account`);
  return false;
};
