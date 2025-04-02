
import { Dispatch, SetStateAction } from 'react';
import { toast } from 'sonner';
import { supabase } from '../../../integrations/supabase/client';
import { Developer, Client, AuthState } from '../../../types/product';
import { debugCheckProfileExists } from '../../../integrations/supabase/profiles';
import { registerWithSupabase } from './supabaseRegistration';
import { createUserProfile, createDeveloperProfile, createClientProfile } from './profileCreation';
import { registerWithLocalStorage } from './localStorageRegistration';

/**
 * Main registration function that orchestrates the entire registration process
 */
export const register = async (
  userData: Partial<Developer | Client>, 
  userType: 'developer' | 'client',
  mockDevelopers: Developer[],
  mockClients: Client[],
  setMockDevelopers: Dispatch<SetStateAction<Developer[]>>,
  setMockClients: Dispatch<SetStateAction<Client[]>>,
  setAuthState: Dispatch<SetStateAction<AuthState>>
): Promise<boolean> => {
  // Try Supabase registration first
  if (supabase) {
    try {
      // 1. Register the user with Supabase
      const { success, userId, error } = await registerWithSupabase(userData, userType);
      
      if (!success || !userId) {
        console.error('Supabase registration failed:', error);
        toast.error('Registration failed: ' + error);
        // Fallback to localStorage registration
        return registerWithLocalStorage(userData, userType, mockDevelopers, mockClients, setMockDevelopers, setMockClients, setAuthState);
      }
      
      // 2. Create the base profile
      const profileCreated = await createUserProfile(userId, userData, userType);
      
      if (!profileCreated) {
        console.error('Failed to create user profile');
      }
      
      // 3. Create the type-specific profile
      let typeProfileCreated = false;
      if (userType === 'developer') {
        typeProfileCreated = await createDeveloperProfile(userId, userData as Partial<Developer>);
      } else {
        typeProfileCreated = await createClientProfile(userId, userData as Partial<Client>);
      }
      
      if (!typeProfileCreated) {
        console.error(`Failed to create ${userType} profile`);
      }
      
      // 4. Set the authentication state
      setAuthState({
        isAuthenticated: true,
        userType,
        userId,
      });
      
      localStorage.setItem('authState', JSON.stringify({
        isAuthenticated: true,
        userType,
        userId,
      }));
      
      console.log('Registration completed successfully');
      
      // 5. Verify profile creation with our debug function
      const profileCheck = await debugCheckProfileExists(userId);
      console.log('Profile creation verification:', profileCheck);
      
      return true;
    } catch (error) {
      console.error('Supabase registration exception:', error);
      toast.error('Registration failed with an unexpected error. Please try again.');
      // Fallback to localStorage registration
      return registerWithLocalStorage(userData, userType, mockDevelopers, mockClients, setMockDevelopers, setMockClients, setAuthState);
    }
  } else {
    console.warn('No Supabase client available, falling back to localStorage registration');
    return registerWithLocalStorage(userData, userType, mockDevelopers, mockClients, setMockDevelopers, setMockClients, setAuthState);
  }
};

// Export all registration-related functions
export { registerWithSupabase } from './supabaseRegistration';
export { createUserProfile, createDeveloperProfile, createClientProfile } from './profileCreation';
export { registerWithLocalStorage } from './localStorageRegistration';
