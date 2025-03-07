
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
      
      console.log('Login successful, user data:', data);
      
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
        userType: profileData.user_type as 'developer' | 'client',
        userId: data.user.id,
      });
      
      localStorage.setItem('authState', JSON.stringify({
        isAuthenticated: true,
        userType: profileData.user_type as 'developer' | 'client',
        userId: data.user.id,
      }));
      
      return true;
    } catch (error) {
      console.error('Supabase login exception:', error);
      // Fallback to localStorage login
      return loginWithLocalStorage(email, password, userType, mockDevelopers, mockClients, setAuthState);
    }
  } else {
    console.error('Supabase client is not available. Falling back to localStorage login.');
    // Use localStorage login as fallback
    return loginWithLocalStorage(email, password, userType, mockDevelopers, mockClients, setAuthState);
  }
};

// Helper for localStorage login
const loginWithLocalStorage = (
  email: string, 
  password: string, 
  userType: 'developer' | 'client',
  mockDevelopers: Developer[],
  mockClients: Client[],
  setAuthState: Dispatch<SetStateAction<AuthState>>
): boolean => {
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
