
import { supabase } from '../../integrations/supabase/client';
import { toast } from 'sonner';

// Log out utility - extracted from AuthContext
export const logoutUser = async (): Promise<void> => {
  console.log('Logging out user...');
  
  try {
    // First clear local state to ensure UI updates immediately
    localStorage.removeItem('authState');
    
    // Then attempt to sign out from Supabase
    if (supabase) {
      try {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error('Error signing out from Supabase:', error);
          toast.error('Error signing out from server, but you have been logged out locally');
        } else {
          console.log('Successfully signed out from Supabase');
        }
      } catch (supabaseError) {
        console.error('Exception during Supabase signout:', supabaseError);
        toast.error('Error communicating with the server, but you have been logged out locally');
      }
    }
    
    console.log('Logout completed, auth state cleared');
    toast.success('Successfully logged out');
    
    // Force page refresh to clear any cached state
    window.location.href = '/';
    
  } catch (error) {
    console.error('Exception during logout:', error);
    toast.error('An error occurred during logout');
    
    // Still force refresh on error
    window.location.href = '/';
  }
};

// Check Supabase session and get user profile
export const checkSupabaseSession = async (setAuthState: (state: any) => void) => {
  if (!supabase) {
    console.error('Supabase client is not available. Authentication will not work properly.');
    return null;
  }
  
  console.log('Checking Supabase session...');
  const { data, error } = await supabase.auth.getSession();
  
  console.log('Supabase session result:', { data, error });
  if (data.session) {
    // Get user profile from Supabase
    console.log('User is authenticated, fetching profile for user:', data.session.user.id);
    const { data: profileData, error: profileError } = await supabase.from('profiles')
      .select('*')
      .eq('id', data.session.user.id)
      .single();
      
    console.log('Profile fetch result:', { profileData, profileError });
    if (profileData && !error) {
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
        // Get user profile
        const { data: profileData } = await supabase.from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
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
