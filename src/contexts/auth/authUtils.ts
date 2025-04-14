import { supabase } from '../../integrations/supabase/client';
import { toast } from 'sonner';

// User profile cache to reduce database queries
const userProfileCache = new Map<string, { userType: string | null, timestamp: number }>();
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

// Log out utility - extracted from AuthContext
export const logoutUser = async (): Promise<void> => {
  console.log('Logging out user...');
  
  try {
    // First clear local state to ensure UI updates immediately
    localStorage.removeItem('authState');
    localStorage.removeItem('supabase.auth.token');
    
    // Create a timeout promise to ensure we don't hang on logout
    const timeoutPromise = new Promise<void>((_, reject) => {
      setTimeout(() => {
        console.warn('Supabase signout timeout reached');
        reject(new Error('Logout timeout reached'));
      }, 3000); // 3 second timeout for Supabase operations
    });
    
    // Then attempt to sign out from Supabase
    if (supabase) {
      try {
        // Race between the signout request and timeout
        await Promise.race([
          (async () => {
            const { error } = await supabase.auth.signOut();
            if (error) {
              throw error;
            }
          })(),
          timeoutPromise
        ]);
        
        console.log('Successfully signed out from Supabase');
      } catch (supabaseError) {
        console.error('Exception during Supabase signout:', supabaseError);
        // Continue with logout even if Supabase fails
      }
    }
    
    console.log('Logout completed, auth state cleared');
    toast.success('Successfully logged out');
    
    // Force page refresh to clear any cached state - with a small delay to ensure toast is visible
    setTimeout(() => {
      // Use href to ensure complete page reload, bypassing React Router
      window.location.href = '/';
    }, 300);
    
  } catch (error) {
    console.error('Exception during logout:', error);
    toast.error('An error occurred during logout');
    
    // Still force refresh on error after a short delay
    setTimeout(() => {
      window.location.href = '/';
    }, 300);
  }
};

// Add a function to check if email is verified
export const isEmailVerified = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.auth.getUser();
    
    if (error || !data.user) {
      return false;
    }
    
    return data.user.email_confirmed_at !== null;
  } catch (error) {
    console.error('Error checking email verification:', error);
    return false;
  }
};

// Add update password functionality
export const updatePassword = async (newPassword: string): Promise<boolean> => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error) {
      console.error('Error updating user password:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Exception during password update:', error);
    return false;
  }
};

// Add debug function to check user authentication status
export const debugCheckAuthState = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error checking auth session:', error);
      return { authenticated: false, error: error.message };
    }
    
    if (!session) {
      console.log('No active Supabase session found');
      return { authenticated: false };
    }
    
    console.log('Active session found for user:', session.user.id);
    return { 
      authenticated: true, 
      userId: session.user.id,
      email: session.user.email
    };
  } catch (err: any) {
    console.error('Exception in debugCheckAuthState:', err);
    return { authenticated: false, error: err.message };
  }
};

// Add debug function to check profile creation
export const debugCheckProfile = async (userId: string | null) => {
  if (!userId) {
    console.error('Cannot check profile: No user ID provided');
    return { exists: false, error: 'No user ID provided' };
  }
  
  try {
    console.log(`Checking profile existence for user: ${userId}`);
    
    // Check base profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (profileError) {
      console.error('Error checking base profile:', profileError);
      
      // If the error is "No rows found", it means the profile doesn't exist
      if (profileError.code === 'PGRST116') {
        return { exists: false, reason: 'Base profile not found' };
      }
      
      return { exists: false, error: profileError.message };
    }
    
    // Get the user type from the profile
    const userType = profileData?.user_type;
    console.log(`User type from profile: ${userType}`);
    
    // Check type-specific profile
    if (userType === 'developer') {
      const { data: devProfileData, error: devProfileError } = await supabase
        .from('developer_profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (devProfileError) {
        console.error('Error checking developer profile:', devProfileError);
        
        // If the error is "No rows found", it means the developer profile doesn't exist
        if (devProfileError.code === 'PGRST116') {
          return { 
            exists: true, 
            baseProfileExists: true,
            typeProfileExists: false, 
            reason: 'Base profile exists but developer profile not found',
            baseProfile: profileData
          };
        }
        
        return { 
          exists: true, 
          baseProfileExists: true,
          typeProfileExists: false,
          error: devProfileError.message,
          baseProfile: profileData
        };
      }
      
      return { 
        exists: true, 
        complete: true,
        baseProfile: profileData,
        typeProfile: devProfileData
      };
    } else if (userType === 'client') {
      const { data: clientProfileData, error: clientProfileError } = await supabase
        .from('client_profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (clientProfileError) {
        console.error('Error checking client profile:', clientProfileError);
        
        // If the error is "No rows found", it means the client profile doesn't exist
        if (clientProfileError.code === 'PGRST116') {
          return { 
            exists: true, 
            baseProfileExists: true,
            typeProfileExists: false, 
            reason: 'Base profile exists but client profile not found',
            baseProfile: profileData
          };
        }
        
        return { 
          exists: true, 
          baseProfileExists: true,
          typeProfileExists: false,
          error: clientProfileError.message,
          baseProfile: profileData
        };
      }
      
      return { 
        exists: true, 
        complete: true,
        baseProfile: profileData,
        typeProfile: clientProfileData
      };
    } else {
      return { 
        exists: true, 
        baseProfileExists: true,
        typeProfileExists: false,
        reason: 'User type is missing or invalid',
        baseProfile: profileData
      };
    }
  } catch (err: any) {
    console.error('Exception in debugCheckProfile:', err);
    return { exists: false, error: err.message };
  }
};

// Add function to create missing profile parts if needed
export const debugCreateMissingProfiles = async (userId: string, userType: 'developer' | 'client', email: string, name: string) => {
  try {
    console.log(`Attempting to create missing profiles for ${userType} with ID: ${userId}`);
    
    // First check what we have
    const checkResult = await debugCheckProfile(userId);
    console.log('Profile check result:', checkResult);
    
    // If base profile doesn't exist, create it
    if (!checkResult.baseProfileExists) {
      console.log('Creating base profile...');
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          user_type: userType,
          email: email,
          name: name || 'New User',
          image: '/placeholder.svg',
          profile_completed: false,
          username: email.split('@')[0]
        })
        .select();
        
      if (profileError) {
        console.error('Error creating base profile:', profileError);
        return { success: false, error: profileError.message };
      }
      
      console.log('Base profile created:', profileData);
      
      // Update the check result
      checkResult.baseProfileExists = true;
      checkResult.baseProfile = profileData[0];
    }
    
    // If type-specific profile doesn't exist, create it
    if (!checkResult.typeProfileExists) {
      console.log(`Creating ${userType} profile...`);
      
      if (userType === 'developer') {
        const { data: devProfileData, error: devProfileError } = await supabase
          .from('developer_profiles')
          .insert({
            id: userId,
            category: 'frontend',
            skills: ['JavaScript', 'React'],
            hourly_rate: 75,
            minute_rate: 1.5,
            experience: '3+ years',
            availability: true,
            rating: 4.5,
            communication_preferences: ['chat', 'video'],
            premium_verified: false
          })
          .select();
          
        if (devProfileError) {
          console.error('Error creating developer profile:', devProfileError);
          return { 
            success: false, 
            baseProfileExists: true,
            typeProfileExists: false,
            error: devProfileError.message 
          };
        }
        
        console.log('Developer profile created:', devProfileData);
        
        return { 
          success: true, 
          created: true, 
          message: 'Created missing developer profile' 
        };
      } else {
        const { data: clientProfileData, error: clientProfileError } = await supabase
          .from('client_profiles')
          .insert({
            id: userId,
            looking_for: ['web development'],
            preferred_help_format: ['chat'],
            tech_stack: ['React'],
            budget_per_hour: 75,
            payment_method: 'Stripe',
            communication_preferences: ['chat'],
            profile_completion_percentage: 30
          })
          .select();
          
        if (clientProfileError) {
          console.error('Error creating client profile:', clientProfileError);
          return { 
            success: false, 
            baseProfileExists: true,
            typeProfileExists: false,
            error: clientProfileError.message 
          };
        }
        
        console.log('Client profile created:', clientProfileData);
        
        return { 
          success: true, 
          created: true, 
          message: 'Created missing client profile' 
        };
      }
    }
    
    return { success: true, message: 'Profiles already exist and complete' };
  } catch (err: any) {
    console.error('Exception in debugCreateMissingProfiles:', err);
    return { success: false, error: err.message };
  }
};

// Modified checkSupabaseSession function to handle profile creation if needed
export const checkSupabaseSession = async (
  setAuthState: (state: any) => void
) => {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error checking Supabase session:', error);
      return null;
    }
    
    if (data?.session) {
      const user = data.session.user;
      console.log('Supabase session found for user:', user.id);
      
      // Check for user metadata to determine user type
      let userType = null;
      
      // First, look in local storage (cached auth state)
      const localAuthState = localStorage.getItem('authState');
      if (localAuthState) {
        try {
          const parsedState = JSON.parse(localAuthState);
          if (parsedState.userType) {
            userType = parsedState.userType;
            console.log('Retrieved user type from local storage:', userType);
          }
        } catch (e) {
          console.error('Error parsing local auth state:', e);
        }
      }
      
      // If no user type in local storage, check profiles table
      if (!userType) {
        try {
          console.log('Looking up user type from profiles table');
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('user_type')
            .eq('id', user.id)
            .single();
            
          if (profileError) {
            console.warn('Error fetching profile:', profileError.message);
            // If profile not found, we might need to create it based on registration info
          } else if (profileData) {
            userType = profileData.user_type;
            console.log('Found user type in profiles table:', userType);
          }
        } catch (e) {
          console.error('Error fetching profile data:', e);
        }
      }
      
      // Update auth state with the current user
      setAuthState({
        isAuthenticated: true,
        userType,
        userId: user.id,
      });
      
      // Check for and create missing profiles if needed
      if (userType) {
        console.log('Checking if profiles are complete...');
        const checkResult = await debugCheckProfile(user.id);
        
        if (!checkResult.complete) {
          console.log('Profile is incomplete, attempting to fix...');
          await debugCreateMissingProfiles(
            user.id, 
            userType as 'developer' | 'client',
            user.email || '',
            user.user_metadata?.name || ''
          );
        }
      }
      
      return {
        user,
        userType,
      };
    }
    
    console.log('No Supabase session found');
    return null;
  } catch (err) {
    console.error('Exception in checkSupabaseSession:', err);
    return null;
  }
};

// Setup auth state change listener
export const setupAuthStateChangeListener = (setAuthState: (state: any) => void) => {
  if (!supabase) return { unsubscribe: () => {} };
  
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      console.log('Auth state changed:', event, 'Session:', session ? 'exists' : 'none');
      
      if (event === 'SIGNED_IN' && session) {
        try {
          const userId = session.user.id;
          
          // Check the cache first to avoid unnecessary database queries
          const cachedProfile = userProfileCache.get(userId);
          const now = Date.now();
          
          if (cachedProfile && (now - cachedProfile.timestamp) < CACHE_EXPIRY) {
            console.log('Using cached user profile data for auth state change');
            const authState = {
              isAuthenticated: true,
              userType: cachedProfile.userType,
              userId: userId,
            };
            
            setAuthState(authState);
            localStorage.setItem('authState', JSON.stringify(authState));
            return;
          }
          
          // Get user profile
          const { data: profileData, error: profileError } = await supabase.from('profiles')
            .select('user_type')
            .eq('id', session.user.id)
            .single();
            
          if (profileError) {
            console.error('Error fetching profile on auth state change:', profileError);
            return;
          }
            
          if (profileData) {
            // Ensure userType is 'developer' | 'client' | null
            const userType = profileData.user_type === 'developer' || profileData.user_type === 'client' 
              ? profileData.user_type as 'developer' | 'client'
              : null;
              
            // Cache the profile data
            userProfileCache.set(userId, {
              userType,
              timestamp: now
            });
              
            const authState = {
              isAuthenticated: true,
              userType: userType,
              userId: session.user.id,
            };
            
            setAuthState(authState);
            localStorage.setItem('authState', JSON.stringify(authState));
          }
        } catch (error) {
          console.error('Exception in auth state change handler:', error);
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
  
  return subscription;
};

// Add a function to check if a user is stuck in a loading state
export const isUserStuckInLoadingState = (): boolean => {
  // Check if there might be loading state persisted in localStorage
  const loadingStateStr = localStorage.getItem('appLoadingState');
  if (loadingStateStr) {
    try {
      const loadingState = JSON.parse(loadingStateStr);
      const { isLoading, timestamp } = loadingState;
      
      if (isLoading) {
        // If it's been loading for more than 1 minute, consider user stuck
        const loadingDuration = Date.now() - timestamp;
        if (loadingDuration > 60000) { // 1 minute
          return true;
        }
      }
    } catch (e) {
      // Ignore parsing errors
    }
  }
  
  return false;
};

// Helper to set loading state in localStorage
export const setAppLoadingState = (isLoading: boolean): void => {
  if (isLoading) {
    localStorage.setItem('appLoadingState', JSON.stringify({
      isLoading: true,
      timestamp: Date.now()
    }));
  } else {
    localStorage.removeItem('appLoadingState');
  }
};

// Add reset password functionality
export const resetPassword = async (email: string): Promise<boolean> => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    if (error) {
      console.error('Error sending reset password email:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Exception during password reset request:', error);
    return false;
  }
};
