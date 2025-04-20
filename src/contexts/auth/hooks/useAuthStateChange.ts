
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
      (event, session) => {
        console.log(`Auth state changed: ${event}`, session ? 'Has session' : 'No session');
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            // Using a synchronized update pattern to avoid race conditions
            setAuthState(prevState => {
              // Initial update with basic auth info
              const basicAuthState: AuthState = {
                isAuthenticated: true,
                userId: session.user.id,
                userType: prevState.userType // Preserve existing userType if available
              };
              
              return basicAuthState;
            });
            
            // Defer profile fetch to avoid blocking the auth state update
            setTimeout(async () => {
              try {
                console.time('profile-fetch');
                // Add timeout protection for the profile fetch
                const controller = new AbortController();
                const timeoutId = setTimeout(() => {
                  controller.abort();
                  console.warn('Profile fetch timed out');
                }, 4000);
                
                const { data: profileData, error } = await supabase
                  .from('profiles')
                  .select('user_type')
                  .eq('id', session.user.id)
                  .abortSignal(controller.signal)
                  .single();
                  
                clearTimeout(timeoutId);
                console.timeEnd('profile-fetch');
                  
                if (error) {
                  console.error('Error fetching user type:', error);
                  
                  // User already has basic auth state from earlier
                  toast.error("Couldn't fetch your user profile. Some features may be limited.");
                  return;
                }
                
                let userType: 'developer' | 'client' | null = null;
                
                if (profileData?.user_type === 'developer') {
                  userType = 'developer';
                } else if (profileData?.user_type === 'client') {
                  userType = 'client';
                }
                
                // Use functional state update to avoid race conditions
                setAuthState(prevState => {
                  const newAuthState: AuthState = {
                    isAuthenticated: true,
                    userId: session.user.id,
                    userType: userType
                  };
                  
                  try {
                    localStorage.setItem('authState', JSON.stringify(newAuthState));
                  } catch (storageError) {
                    console.error('Error saving auth state to localStorage:', storageError);
                  }
                  
                  console.log('Updated auth state from session change:', newAuthState);
                  return newAuthState;
                });
              } catch (error) {
                console.error('Error fetching user type during auth change:', error);
              }
            }, 0);
          }
        } else if (event === 'SIGNED_OUT') {
          // Immediately clear auth state on sign out
          const newState: AuthState = {
            isAuthenticated: false,
            userType: null,
            userId: null,
          };
          
          setAuthState(newState);
          
          try {
            localStorage.removeItem('authState');
          } catch (storageError) {
            console.error('Error removing auth state from localStorage:', storageError);
          }
          
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
