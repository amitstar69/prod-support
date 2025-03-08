import { supabase } from '../../integrations/supabase/client';
import { toast } from 'sonner';

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

// Check Supabase session and get user profile
export const checkSupabaseSession = async (setAuthState: (state: any) => void) => {
  if (!supabase) {
    console.error('Supabase client is not available. Authentication will not work properly.');
    return null;
  }
  
  console.log('Checking Supabase session...');
  
  try {
    const { data, error } = await supabase.auth.getSession();
    
    console.log('Supabase session result:', { data, error });
    if (data.session) {
      // Get user profile from Supabase
      console.log('User is authenticated, fetching profile for user:', data.session.user.id);
      
      try {
        const { data: profileData, error: profileError } = await supabase.from('profiles')
          .select('*')
          .eq('id', data.session.user.id)
          .single();
          
        console.log('Profile fetch result:', { profileData, profileError });
        
        if (profileError) {
          console.error('Error fetching profile:', profileError);
          return null;
        }
        
        if (profileData) {
          // Ensure userType is 'developer' | 'client' | null
          const userType = profileData.user_type === 'developer' || profileData.user_type === 'client' 
            ? profileData.user_type as 'developer' | 'client'
            : null;
          
          const authState = {
            isAuthenticated: true,
            userType: userType,
            userId: data.session.user.id,
          };
          
          setAuthState(authState);
          localStorage.setItem('authState', JSON.stringify(authState));
          
          return authState;
        }
      } catch (profileError) {
        console.error('Exception during profile fetch:', profileError);
        return null;
      }
    }
  } catch (error) {
    console.error('Exception during session check:', error);
  }
  
  return null;
};

// Setup auth state change listener
export const setupAuthStateChangeListener = (setAuthState: (state: any) => void) => {
  if (!supabase) return { unsubscribe: () => {} };
  
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      console.log('Auth state changed:', event, 'Session:', session ? 'exists' : 'none');
      
      if (event === 'SIGNED_IN' && session) {
        try {
          // Get user profile
          const { data: profileData, error: profileError } = await supabase.from('profiles')
            .select('*')
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
