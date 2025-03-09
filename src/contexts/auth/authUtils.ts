
import { supabase } from '../../integrations/supabase/client';
import { Dispatch, SetStateAction } from 'react';
import { AuthState } from './types';
import { toast } from 'sonner';

// Check if a user is already logged in with Supabase
export const checkSupabaseSession = async (
  setAuthState: Dispatch<SetStateAction<AuthState>>
): Promise<AuthState | null> => {
  try {
    console.log('Checking Supabase session...');
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error checking Supabase session:', error);
      return null;
    }
    
    if (!data.session) {
      console.log('No active Supabase session');
      return { isAuthenticated: false, userType: null, userId: null };
    }
    
    console.log('Active Supabase session found for user:', data.session.user.id);
    
    // Get user profile to determine user type
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.session.user.id)
      .maybeSingle();
      
    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return null;
    }
    
    if (!profileData) {
      console.log('No profile found for this user, creating one');
      
      // For safety, we'll create a simple profile with client permissions
      // The user will need to set their profile type later
      const newAuthState = { 
        isAuthenticated: true, 
        userType: 'client' as 'client' | 'developer',
        userId: data.session.user.id
      };
      
      setAuthState(newAuthState);
      return newAuthState;
    }
    
    const authState = {
      isAuthenticated: true,
      userType: profileData.user_type as 'developer' | 'client',
      userId: data.session.user.id,
    };
    
    console.log('Setting auth state from session:', authState);
    setAuthState(authState);
    return authState;
  } catch (error) {
    console.error('Exception checking Supabase session:', error);
    return null;
  }
};

// Set up authentication state change listener
export const setupAuthStateChangeListener = (
  setAuthState: Dispatch<SetStateAction<AuthState>>
) => {
  console.log('Setting up auth state change listener');
  
  // Return the subscription object directly which has the unsubscribe method
  const { subscription } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      console.log('Auth state changed:', event, session ? 'with session' : 'no session');
      
      if (event === 'SIGNED_OUT') {
        // User signed out, clear auth state
        setAuthState({
          isAuthenticated: false,
          userType: null,
          userId: null,
        });
        localStorage.removeItem('authState');
        console.log('Auth state cleared due to sign out');
        return;
      }
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        // User signed in or token refreshed, update auth state
        if (!session) {
          console.error('No session available after sign in or token refresh');
          return;
        }
        
        try {
          // Get user profile to determine user type
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();
            
          if (profileError) {
            console.error('Error fetching profile after auth change:', profileError);
            return;
          }
          
          if (!profileData) {
            console.error('No profile found after auth change');
            // Try to extract user type from user metadata
            const userType = session.user.user_metadata?.user_type as 'developer' | 'client' || 'client';
            
            // Create a temporary auth state
            const tempAuthState = {
              isAuthenticated: true,
              userType: userType,
              userId: session.user.id,
            };
            
            console.log('Setting temporary auth state from metadata:', tempAuthState);
            setAuthState(tempAuthState);
            localStorage.setItem('authState', JSON.stringify(tempAuthState));
            return;
          }
          
          const authState = {
            isAuthenticated: true,
            userType: profileData.user_type as 'developer' | 'client',
            userId: session.user.id,
          };
          
          console.log('Setting auth state from auth change:', authState);
          setAuthState(authState);
          localStorage.setItem('authState', JSON.stringify(authState));
        } catch (error) {
          console.error('Exception handling auth state change:', error);
        }
      }
    }
  ).data;
  
  return subscription;
};

// Log out a user
export const logoutUser = async (): Promise<void> => {
  console.log('Logging out user');
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Error during Supabase sign out:', error);
      toast.error('Error signing out: ' + error.message);
      throw error;
    }
    
    // Clear local storage auth state
    localStorage.removeItem('authState');
    console.log('User logged out and auth state cleared');
    toast.success('You have been signed out');
  } catch (error) {
    console.error('Exception during logout:', error);
    // Forcefully clear local storage auth state even if Supabase logout fails
    localStorage.removeItem('authState');
    toast.error('Error during sign out, but session cleared locally');
    throw error;
  }
};
