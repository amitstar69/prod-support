
import { Dispatch, SetStateAction } from 'react';
import { AuthState } from '../types';
import { supabase } from '../../../integrations/supabase/client';

export const setupAuthStateChangeListener = (
  setAuthState: Dispatch<SetStateAction<AuthState>>
) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      console.log(`Auth state changed: ${event}`, session);
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          try {
            const { data: profileData, error } = await supabase
              .from('profiles')
              .select('user_type')
              .eq('id', session.user.id)
              .single();
              
            if (error) {
              console.error('Error fetching user type:', error);
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
};
