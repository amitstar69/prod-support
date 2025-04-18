
import { Dispatch, SetStateAction } from 'react';
import { AuthState } from '../types';
import { supabase } from '../../../integrations/supabase/client';
import { toast } from 'sonner';

export const setupAuthStateChangeListener = (
  setAuthState: Dispatch<SetStateAction<AuthState>>
) => {
  try {
    console.log('Setting up auth state change listener');
    
    if (!supabase || !supabase.auth) {
      console.error('Supabase client not properly initialized');
      return { unsubscribe: () => {} };
    }
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`Auth state changed: ${event}`, session ? 'Has session' : 'No session');
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            // Always update with basic auth information first
            const basicAuthState: AuthState = {
              isAuthenticated: true,
              userId: session.user.id,
              userType: null
            };
            
            // Update immediately with basic info
            setAuthState(basicAuthState);
            localStorage.setItem('authState', JSON.stringify(basicAuthState));
            
            try {
              // Add timeout protection for the profile fetch
              const controller = new AbortController();
              const timeoutId = setTimeout(() => {
                controller.abort();
                console.warn('Profile fetch timed out');
              }, 10000); // Increased from 5s to 10s
              
              // Attempt to fetch additional profile data
              // Set up the Supabase query with options at the PostgrestFilterBuilder level
              const query = supabase
                .from('profiles')
                .select('user_type')
                .eq('id', session.user.id);
                
              // Apply the AbortSignal to the query
              const { data: profileData, error } = await query.single({
                head: false,
                count: null,
                signal: controller.signal
              });
                
              clearTimeout(timeoutId);
                
              if (error) {
                console.error('Error fetching user type:', error);
                
                // User is still authenticated even without profile
                toast.warning("Couldn't fetch your complete profile. Some features may be limited.");
                return;
              }
              
              let userType: 'developer' | 'client' | null = null;
              
              if (profileData?.user_type === 'developer') {
                userType = 'developer';
              } else if (profileData?.user_type === 'client') {
                userType = 'client';
              }
              
              const newAuthState: AuthState = {
                isAuthenticated: true,
                userId: session.user.id,
                userType: userType
              };
              
              setAuthState(newAuthState);
              localStorage.setItem('authState', JSON.stringify(newAuthState));
              console.log('Updated auth state from session change:', newAuthState);
            } catch (error) {
              console.error('Error fetching user type during auth change:', error);
              
              // Just continue with basic auth info - don't interrupt the auth process
              // The user is still authenticated even if we can't get their profile
              console.log('Continuing with basic auth information despite profile fetch error');
            }
          }
        } else if (event === 'SIGNED_OUT') {
          const newState: AuthState = {
            isAuthenticated: false,
            userType: null,
            userId: null,
          };
          setAuthState(newState);
          localStorage.removeItem('authState');
          console.log('Cleared auth state on sign out');
        }
      }
    );
    
    return subscription;
  } catch (error) {
    console.error('Error setting up auth state change listener:', error);
    return { unsubscribe: () => {} };
  }
};
