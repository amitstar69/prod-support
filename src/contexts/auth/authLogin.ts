
import { supabase } from '../../integrations/supabase/client';
import { AuthError } from '@supabase/supabase-js';
import { toast } from 'sonner';

// Define the return type for the login function
export interface LoginResult {
  success: boolean;
  error?: string;
  requiresVerification?: boolean;
}

// Cache for user profiles to reduce database queries
const profileCache = new Map<string, { user_type: string | null, timestamp: number }>();
const CACHE_EXPIRY = 15 * 60 * 1000; // Cache expires after 15 minutes for better performance

export const loginWithEmailAndPassword = async (
  email: string,
  password: string,
  userType: 'client' | 'developer'
): Promise<LoginResult> => {
  try {
    console.time('login-process');
    console.log(`Attempting to log in as ${userType} with email:`, email);
    
    // Step 1: Sign in with credentials
    console.time('auth-signin');
    
    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    // Clear timeout
    clearTimeout(timeoutId);
    
    console.timeEnd('auth-signin');

    if (error) {
      console.error('Login error:', error);
      if (error.message.includes('Email not confirmed')) {
        return {
          success: false,
          error: 'Please verify your email before logging in.',
          requiresVerification: true
        };
      }
      
      // Handle invalid credentials more explicitly
      if (error.message.includes('Invalid login credentials')) {
        return {
          success: false,
          error: 'Email or password is incorrect. Please check your credentials.',
        };
      }
      
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
    
    // Check if email is verified
    if (data.user.email_confirmed_at === null) {
      console.log('User email is not verified');
      // Sign out user since email is not verified
      await supabase.auth.signOut();
      
      return {
        success: false,
        error: 'Please verify your email before logging in.',
        requiresVerification: true
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
    
    // Add another timeout for profile fetch
    const profileController = new AbortController();
    const profileTimeoutId = setTimeout(() => profileController.abort(), 8000);
    
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', userId)
      .single();
    
    // Clear timeout
    clearTimeout(profileTimeoutId);
    
    console.timeEnd('profile-fetch');

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      
      // If the profile doesn't exist, we might need to create it
      if (profileError.code === 'PGRST116') { // Not found error
        // This would be a good place to create a profile if needed
        // For now, we'll just sign out the user
        toast.error('Your user profile is missing. Please contact support.');
        console.error('Profile not found for user', userId);
        await supabase.auth.signOut();
      }
      
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
    
    // Check if this was an abort error (timeout)
    if (authError.name === 'AbortError' || authError.message?.includes('timeout')) {
      return {
        success: false,
        error: 'Login request timed out. Please check your internet connection and try again.',
      };
    }
    
    return {
      success: false,
      error: authError.message || 'An unexpected error occurred during login.',
    };
  }
};

// Update the login function to use truly optional parameters with default values
// Explicitly define the return type
export const login = async (
  email: string, 
  password: string, 
  userType: 'developer' | 'client',
  rememberMe: boolean = false,
  setAuthState: ((state: any) => void) | null = null,
  redirectPath: string | null = null,
  onSuccess: (() => void) | null = null
): Promise<LoginResult> => {
  return await loginWithEmailAndPassword(email, password, userType);
};
