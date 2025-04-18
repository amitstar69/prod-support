
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
            try {
              // Add timeout protection for the profile fetch
              const controller = new AbortController();
              const timeoutId = setTimeout(() => {
                controller.abort();
                console.warn('Profile fetch timed out');
              }, 5000); // Reduced from 8000 to fail faster
              
              const { data: profileData, error } = await supabase
                .from('profiles')
                .select('user_type')
                .eq('id', session.user.id)
                .single();
                
              clearTimeout(timeoutId);
                
              if (error) {
                console.error('Error fetching user type:', error);
                
                // Still update auth state as authenticated but without user type
                const basicAuthState: AuthState = {
                  isAuthenticated: true,
                  userId: session.user.id,
                  userType: null
                };
                
                setAuthState(basicAuthState);
                localStorage.setItem('authState', JSON.stringify(basicAuthState));
                
                // Notify user of the issue
                toast.error("Couldn't fetch your user profile. Some features may be limited.");
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
              
              // Still update with basic auth information even if profile fetch fails
              const fallbackAuthState: AuthState = {
                isAuthenticated: true,
                userId: session.user.id,
                userType: null
              };
              
              setAuthState(fallbackAuthState);
              localStorage.setItem('authState', JSON.stringify(fallbackAuthState));
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
