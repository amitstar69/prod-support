
import { supabase } from '../../integrations/supabase/client';
import { toast } from 'sonner';

// Improved logout function with better timeout handling
export const logoutUser = async (): Promise<boolean> => {
  console.log('Logging out user');
  
  try {
    // Create a timeout promise
    const timeoutPromise = new Promise<boolean>((resolve) => {
      setTimeout(() => {
        console.warn('Supabase signout timeout reached');
        resolve(false);
      }, 3000); // 3 second timeout
    });
    
    // Create the actual signout promise
    const signOutPromise = supabase.auth.signOut().then(() => true);
    
    // Race the promises
    const success = await Promise.race([signOutPromise, timeoutPromise]);
    
    // Clear any local storage data regardless of success
    localStorage.removeItem('authState');
    
    // Return the success status
    return success;
  } catch (error) {
    console.error('Error during logout:', error);
    localStorage.removeItem('authState');
    return false;
  }
};

// Check if user has a valid Supabase session
export const checkSupabaseSession = async (setAuthState?: (state: any) => void): Promise<any> => {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error checking Supabase session:', error);
      return null;
    }
    
    if (!data.session) {
      console.info('Supabase session check successful: No active session');
      return null;
    }
    
    console.log('Supabase auth check result:', data.session ? 'Has session' : 'No session');
    
    // If we have a valid session and a callback to update state
    if (data.session && setAuthState) {
      try {
        // Get the user type from profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', data.session.user.id)
          .maybeSingle();
          
        if (profileError) {
          console.error('Error fetching user type during session check:', profileError);
        }
        
        // Update auth state with user data
        const userType = profileData?.user_type === 'developer' ? 'developer' : 
                        profileData?.user_type === 'client' ? 'client' : null;
        
        const newState = {
          isAuthenticated: true,
          userId: data.session.user.id,
          userType: userType
        };
        
        setAuthState(newState);
        localStorage.setItem('authState', JSON.stringify(newState));
        console.log('Updated auth state from session check:', newState);
      } catch (error) {
        console.error('Error processing session data:', error);
      }
    }
    
    return data;
  } catch (error) {
    console.error('Exception in checkSupabaseSession:', error);
    return null;
  }
};

// Helper to get user's home route based on their type
export const getUserHomeRoute = (userType: string | null): string => {
  if (userType === 'developer') {
    return '/developer-dashboard';
  } else if (userType === 'client') {
    return '/client-dashboard';
  }
  return '/';
};

// Debug function to check profile consistency
export const debugCheckProfile = async (userId: string): Promise<{complete: boolean, profiles: boolean, userProfile: boolean}> => {
  try {
    // Check if base profile exists
    const { data: baseProfile, error: baseProfileError } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', userId)
      .maybeSingle();
      
    if (baseProfileError) {
      console.error('Error checking base profile:', baseProfileError);
    }
    
    const userType = baseProfile?.user_type;
    let userProfileExists = false;
    
    // Check if type-specific profile exists
    if (userType === 'developer') {
      const { data, error } = await supabase
        .from('developer_profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();
        
      if (error) {
        console.error('Error checking developer profile:', error);
      }
      
      userProfileExists = !!data;
    } else if (userType === 'client') {
      const { data, error } = await supabase
        .from('client_profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();
        
      if (error) {
        console.error('Error checking client profile:', error);
      }
      
      userProfileExists = !!data;
    }
    
    return {
      complete: !!baseProfile && userProfileExists,
      profiles: !!baseProfile,
      userProfile: userProfileExists
    };
  } catch (error) {
    console.error('Error in debugCheckProfile:', error);
    return {
      complete: false,
      profiles: false,
      userProfile: false
    };
  }
};

// Debug function to create missing profiles
export const debugCreateMissingProfiles = async (
  userId: string,
  userType: 'developer' | 'client',
  email: string = '',
  name: string = ''
): Promise<{success: boolean, message: string}> => {
  try {
    // Get user data if email or name not provided
    if (!email || !name) {
      const { data: userData } = await supabase.auth.getUser();
      if (userData && userData.user) {
        email = email || userData.user.email || '';
        name = name || userData.user.user_metadata?.name || 'New User';
      }
    }
    
    // Check if base profile exists
    const { data: baseProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
      
    // Create base profile if missing
    if (!baseProfile) {
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: email,
          name: name,
          user_type: userType,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          profile_completed: false
        });
        
      if (error) {
        console.error('Error creating base profile:', error);
        return { success: false, message: 'Failed to create base profile' };
      }
      
      console.log('Created missing base profile');
    }
    
    // Check if type-specific profile exists
    if (userType === 'developer') {
      const { data: devProfile } = await supabase
        .from('developer_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
        
      if (!devProfile) {
        const { error } = await supabase
          .from('developer_profiles')
          .insert({
            id: userId,
            hourly_rate: 0,
            minute_rate: 0,
            category: 'frontend',
            skills: []
          });
          
        if (error) {
          console.error('Error creating developer profile:', error);
          return { success: false, message: 'Failed to create developer profile' };
        }
        
        console.log('Created missing developer profile');
      }
    } else if (userType === 'client') {
      const { data: clientProfile } = await supabase
        .from('client_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
        
      if (!clientProfile) {
        const { error } = await supabase
          .from('client_profiles')
          .insert({
            id: userId,
            looking_for: [],
            profile_completion_percentage: 0
          });
          
        if (error) {
          console.error('Error creating client profile:', error);
          return { success: false, message: 'Failed to create client profile' };
        }
        
        console.log('Created missing client profile');
      }
    }
    
    return { success: true, message: 'Profiles repaired successfully' };
  } catch (error) {
    console.error('Error in debugCreateMissingProfiles:', error);
    return { success: false, message: 'Unexpected error during profile repair' };
  }
};
