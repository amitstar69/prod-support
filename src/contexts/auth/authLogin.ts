
import { supabase } from '../../integrations/supabase/client';
import { AuthError } from '@supabase/supabase-js';

export const loginWithEmailAndPassword = async (
  email: string,
  password: string,
  userType: 'client' | 'developer'
): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log(`Attempting to log in as ${userType} with email:`, email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    if (!data.user) {
      console.error('No user returned after login');
      return {
        success: false,
        error: 'Login failed. Please try again.',
      };
    }

    // Fetch user profile to check their user type
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      // Sign out user if we can't verify their user type
      await supabase.auth.signOut();
      return {
        success: false,
        error: 'Error verifying user type. Please try again.',
      };
    }

    // Check if user type matches
    if (profileData.user_type !== userType) {
      console.error('User type mismatch:', profileData.user_type, 'vs', userType);
      // Sign out user if their type doesn't match
      await supabase.auth.signOut();
      return {
        success: false,
        error: `You are registered as a ${profileData.user_type}, not a ${userType}. Please use the correct login option.`,
      };
    }

    console.log('Login successful for', userType);
    return { success: true };
  } catch (error) {
    const authError = error as AuthError;
    console.error('Exception during login:', authError);
    return {
      success: false,
      error: authError.message || 'An unexpected error occurred during login.',
    };
  }
};

// Export login function for AuthStateProvider
export const login = loginWithEmailAndPassword;
