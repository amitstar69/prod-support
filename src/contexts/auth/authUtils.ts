
import { supabase } from '../../integrations/supabase/client';
import { AuthState } from './types';
import { toast } from 'sonner';

// Timeout-safe Supabase sign out function
export const logoutUser = async (): Promise<void> => {
  console.log('Logging out user');
  return new Promise(async (resolve) => {
    try {
      const timeoutId = setTimeout(() => {
        console.warn('Supabase signout timeout reached');
        localStorage.removeItem('authState');
        localStorage.removeItem('sb-xptoyeinviaeevdtyjax-auth-token');
        throw new Error('Logout timeout reached');
      }, 3000);
      
      await supabase.auth.signOut();
      clearTimeout(timeoutId);
      localStorage.removeItem('authState');
      localStorage.removeItem('sb-xptoyeinviaeevdtyjax-auth-token');
      console.log('Logout completed, auth state cleared');
      resolve();
    } catch (error) {
      console.error('Exception during Supabase signout:', error);
      localStorage.removeItem('authState');
      localStorage.removeItem('sb-xptoyeinviaeevdtyjax-auth-token');
      resolve(); // Resolve anyway to avoid hanging promises
    }
  });
};

// Check Supabase session
export const checkSupabaseSession = async (
  setAuthState: React.Dispatch<React.SetStateAction<AuthState>>
): Promise<{success: boolean, userId?: string} | null> => {
  try {
    // Get session from Supabase
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error checking Supabase session:', error);
      return null;
    }
    
    const { session } = data;
    
    if (!session) {
      console.log('No Supabase session found');
      return null;
    }
    
    console.log('Supabase session check successful:', session.user.id);
    
    // Now fetch the user type from profiles
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', session.user.id)
      .single();
      
    if (profileError) {
      console.error('Error fetching user profile during session check:', profileError);
      
      // Check if the error is because the profile doesn't exist
      if (profileError.code === 'PGRST116') { // Not found error code
        // We have a valid auth session but no profile - this is an inconsistent state
        // The user should log out and log in again
        toast.error('Your user profile is missing. Please log out and log in again.');
        return { success: false };
      }
      
      return { success: false };
    }
    
    // Validate user type
    let userType: 'developer' | 'client' | null = null;
    if (profileData?.user_type === 'developer') {
      userType = 'developer';
    } else if (profileData?.user_type === 'client') {
      userType = 'client';
    } else {
      console.warn('User has invalid user_type:', profileData?.user_type);
    }
    
    const newState: AuthState = {
      isAuthenticated: true,
      userId: session.user.id,
      userType: userType
    };
    
    setAuthState(newState);
    localStorage.setItem('authState', JSON.stringify(newState));
    
    return {
      success: true,
      userId: session.user.id
    };
  } catch (error) {
    console.error('Exception checking Supabase session:', error);
    return { success: false };
  }
};

// Function to check if a profile exists for the current user
export const debugCheckProfile = async (userId: string) => {
  if (!userId) {
    console.error('No userId provided to debugCheckProfile');
    return { 
      complete: false, 
      baseProfileExists: false,
      typeProfileExists: false,
      error: 'No userId provided' 
    };
  }
  
  try {
    console.log(`Checking profile completeness for user ${userId}`);
    
    // Step 1: Check if base profile exists
    const { data: baseProfile, error: baseProfileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (baseProfileError) {
      console.error('Error checking base profile:', baseProfileError);
      return { 
        complete: false, 
        baseProfileExists: false,
        typeProfileExists: false,
        error: baseProfileError.message 
      };
    }
    
    // No base profile
    if (!baseProfile) {
      console.log('No base profile found');
      return { 
        complete: false, 
        baseProfileExists: false,
        typeProfileExists: false
      };
    }
    
    console.log('Base profile found:', baseProfile);
    
    // Step 2: Check specific profile type exists
    const userType = baseProfile.user_type;
    
    if (!userType || (userType !== 'developer' && userType !== 'client')) {
      console.error(`Invalid user type: ${userType}`);
      return { 
        complete: false, 
        baseProfileExists: true,
        typeProfileExists: false,
        error: `Invalid user type: ${userType}`
      };
    }
    
    const profileTable = userType === 'developer' ? 'developer_profiles' : 'client_profiles';
    
    const { data: typeProfile, error: typeProfileError } = await supabase
      .from(profileTable)
      .select('*')
      .eq('id', userId)
      .single();
    
    if (typeProfileError) {
      console.error(`Error checking ${userType} profile:`, typeProfileError);
      return { 
        complete: false, 
        baseProfileExists: true,
        typeProfileExists: false,
        userType,
        error: typeProfileError.message 
      };
    }
    
    // Both profiles exist - we're complete
    console.log(`${userType} profile found:`, typeProfile);
    return { 
      complete: true, 
      baseProfileExists: true,
      typeProfileExists: true,
      userType
    };
  } catch (error: any) {
    console.error('Exception in debugCheckProfile:', error);
    return { 
      complete: false,
      baseProfileExists: false,
      typeProfileExists: false,
      error: error.message 
    };
  }
};

// Function to create missing profiles if needed
export const debugCreateMissingProfiles = async (
  userId: string,
  userType: 'developer' | 'client',
  email: string,
  name: string
) => {
  try {
    console.log(`Creating missing profiles for ${userId}, userType: ${userType}`);
    
    // Check current state
    const profileCheck = await debugCheckProfile(userId);
    
    // Needed for profile creation
    if (!email || !name) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        email = email || user.email || '';
        name = name || user.user_metadata?.name || 'New User';
      }
    }
    
    let baseProfileCreated = false;
    let typeProfileCreated = false;
    
    // Create base profile if needed
    if (!profileCheck.baseProfileExists) {
      console.log('Creating base profile...');
      
      const { error: baseProfileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          user_type: userType,
          email: email,
          name: name,
          username: email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, ''),
          image: '/placeholder.svg',
        });
      
      if (baseProfileError) {
        console.error('Error creating base profile:', baseProfileError);
        return { success: false, error: baseProfileError.message };
      }
      
      baseProfileCreated = true;
      console.log('Base profile created successfully');
    }
    
    // Create type-specific profile if needed
    if (!profileCheck.typeProfileExists) {
      console.log(`Creating ${userType} profile...`);
      
      const profileTable = userType === 'developer' ? 'developer_profiles' : 'client_profiles';
      const profileData = userType === 'developer' 
        ? {
            id: userId,
            category: 'frontend',
            skills: ['JavaScript', 'React'],
            hourly_rate: 75,
            minute_rate: 1.5,
          }
        : {
            id: userId,
            profile_completion_percentage: 20,
            looking_for: ['web development'],
            tech_stack: ['React'],
            budget_per_hour: 75,
          };
        
      const { error: typeProfileError } = await supabase
        .from(profileTable)
        .insert(profileData);
      
      if (typeProfileError) {
        console.error(`Error creating ${userType} profile:`, typeProfileError);
        return { 
          success: baseProfileCreated, 
          baseProfileCreated, 
          typeProfileCreated: false,
          error: typeProfileError.message 
        };
      }
      
      typeProfileCreated = true;
      console.log(`${userType} profile created successfully`);
    }
    
    return { 
      success: true, 
      baseProfileCreated, 
      typeProfileCreated,
      userType
    };
  } catch (error: any) {
    console.error('Exception in debugCreateMissingProfiles:', error);
    return { success: false, error: error.message };
  }
};

// Helper to get the appropriate route for a user type
export const getUserHomeRoute = (userType: 'developer' | 'client' | null): string => {
  switch (userType) {
    case 'developer':
      return '/developer-dashboard';
    case 'client':
      return '/client-dashboard';
    default:
      return '/';
  }
};
