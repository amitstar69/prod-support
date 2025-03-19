
import { supabase } from '../../integrations/supabase/client';
import { AuthError } from '@supabase/supabase-js';

// Cache for user profiles to avoid redundant queries
const profileCache = new Map<string, { user_type: string, timestamp: number }>();
const CACHE_EXPIRY = 5 * 60 * 1000; // Cache expires after 5 minutes

export const loginWithEmailAndPassword = async (
  email: string,
  password: string,
  userType: 'client' | 'developer'
): Promise<{ success: boolean; error?: string }> => {
  try {
    console.time('login-process');
    console.log(`Attempting to log in as ${userType} with email:`, email);
    
    // Step 1: Sign in with credentials
    console.time('auth-signin');
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    console.timeEnd('auth-signin');

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

    // Step 2: Check for cached profile data to avoid an extra DB query
    const userId = data.user.id;
    const cachedProfile = profileCache.get(userId);
    const now = Date.now();
    
    // If we have a valid cached profile, use it instead of querying the database
    if (cachedProfile && (now - cachedProfile.timestamp) < CACHE_EXPIRY) {
      console.log('Using cached profile data');
      
      // Check if user type matches
      if (cachedProfile.user_type !== userType) {
        console.error('User type mismatch (from cache):', cachedProfile.user_type, 'vs', userType);
        // Sign out user if their type doesn't match
        await supabase.auth.signOut();
        return {
          success: false,
          error: `You are registered as a ${cachedProfile.user_type}, not a ${userType}. Please use the correct login option.`,
        };
      }
      
      console.log('Login successful for', userType, '(cached validation)');
      console.timeEnd('login-process');
      return { success: true };
    }

    // If no cache hit, fetch user profile to check their user type
    console.time('profile-fetch');
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', userId)
      .single();
    console.timeEnd('profile-fetch');

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      // Sign out user if we can't verify their user type
      await supabase.auth.signOut();
      return {
        success: false,
        error: 'Error verifying user type. Please try again.',
      };
    }

    // Cache the profile data for future logins
    profileCache.set(userId, {
      user_type: profileData.user_type,
      timestamp: now
    });

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
    console.timeEnd('login-process');
    return { success: true };
  } catch (error) {
    const authError = error as AuthError;
    console.error('Exception during login:', authError);
    console.timeEnd('login-process');
    return {
      success: false,
      error: authError.message || 'An unexpected error occurred during login.',
    };
  }
};

// Export login function for AuthStateProvider
export const login = loginWithEmailAndPassword;
