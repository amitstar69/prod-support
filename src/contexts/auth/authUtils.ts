
import { supabase } from '../../integrations/supabase/client';
import { AuthState } from './types';

/**
 * Log out the current user
 */
export const logoutUser = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error during logout:', error);
      return false;
    }
    console.log('User logged out successfully');
    return true;
  } catch (error) {
    console.error('Exception during logout:', error);
    return false;
  }
};

/**
 * Check the current Supabase session and update auth state accordingly
 */
export const checkSupabaseSession = async (
  setAuthState: React.Dispatch<React.SetStateAction<AuthState>>
): Promise<boolean> => {
  try {
    console.log('Checking Supabase session');
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error getting session:', error);
      return false;
    }
    
    if (session?.user) {
      console.log('Session found, updating auth state');
      
      // Fetch user type from the 'profiles' table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', session.user.id)
        .single();
      
      if (profileError) {
        console.error('Error fetching user type:', profileError);
        return false;
      }
      
      let userType: 'developer' | 'client' | null = null;
      
      if (profileData?.user_type === 'developer') {
        userType = 'developer';
      } else if (profileData?.user_type === 'client') {
        userType = 'client';
      }
      
      setAuthState({
        isAuthenticated: true,
        userId: session.user.id,
        userType: userType,
      });
      return true;
    } else {
      console.log('No active session found');
      return false;
    }
  } catch (error) {
    console.error('Error checking session:', error);
    return false;
  }
};

/**
 * Get the home route for a user type
 */
export const getUserHomeRoute = (userType: string | null): string => {
  switch (userType) {
    case 'developer':
      return '/developer/dashboard';
    case 'client':
      return '/client/dashboard';
    default:
      return '/login';
  }
};

/**
 * Debug function to check if profile exists and is consistent
 */
export const debugCheckProfile = async (userId: string) => {
  try {
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', userId)
      .single();
    
    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return {
        exists: false,
        complete: false,
        error: profileError.message
      };
    }
    
    if (!profileData) {
      return {
        exists: false,
        complete: false,
        error: 'No profile found'
      };
    }
    
    let profileTable = '';
    if (profileData.user_type === 'developer') {
      profileTable = 'developer_profiles';
    } else if (profileData.user_type === 'client') {
      profileTable = 'client_profiles';
    } else {
      return {
        exists: true,
        complete: false,
        error: 'Invalid user type'
      };
    }
    
    // Fixed: We need to use a type-safe approach here
    // Using proper table names as literals instead of string variables
    let detailsData;
    let detailsError;
    
    if (profileTable === 'developer_profiles') {
      const result = await supabase
        .from('developer_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      detailsData = result.data;
      detailsError = result.error;
    } else if (profileTable === 'client_profiles') {
      const result = await supabase
        .from('client_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      detailsData = result.data;
      detailsError = result.error;
    }
    
    if (detailsError) {
      console.error('Error fetching profile details:', detailsError);
      return {
        exists: true,
        complete: false,
        error: detailsError.message
      };
    }
    
    const isComplete = !!detailsData;
    
    return {
      exists: true,
      complete: isComplete,
      userType: profileData.user_type,
      profileTable: profileTable
    };
  } catch (error: any) {
    console.error('Error in debugCheckProfile:', error.message);
    return {
      exists: false,
      complete: false,
      error: error.message
    };
  }
};

/**
 * Debug function to create missing profile parts
 */
export const debugCreateMissingProfiles = async (
  userId: string,
  userType: 'developer' | 'client',
  email: string,
  name: string
) => {
  try {
    // Check if a profile already exists
    const profileCheck = await debugCheckProfile(userId);
    
    if (profileCheck.exists) {
      console.log('Profile already exists, skipping creation');
      return {
        success: true,
        message: 'Profile already exists'
      };
    }
    
    // Fixed: Since we're creating a new profile, we'll use the proper table directly
    let error;
    
    if (userType === 'developer') {
      const result = await supabase
        .from('developer_profiles')
        .insert([{
          id: userId,
          email: email,
          name: name
        }]);
      
      error = result.error;
    } else if (userType === 'client') {
      const result = await supabase
        .from('client_profiles')
        .insert([{
          id: userId,
          email: email,
          name: name
        }]);
      
      error = result.error;
    }
    
    if (error) {
      console.error('Error creating profile:', error);
      return {
        success: false,
        message: error.message
      };
    }
    
    console.log('Profile created successfully');
    return {
      success: true,
      message: 'Profile created successfully'
    };
  } catch (error: any) {
    console.error('Error in debugCreateMissingProfiles:', error.message);
    return {
      success: false,
      message: error.message
    };
  }
};
