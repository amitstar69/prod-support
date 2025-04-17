
import { Dispatch, SetStateAction } from 'react';
import { AuthState } from '../types';
import { supabase } from '../../../integrations/supabase/client';
import { checkSupabaseSession } from '../authUtils';
import { toast } from 'sonner';

export const initializeAuthState = async (
  setAuthState: Dispatch<SetStateAction<AuthState>>,
  setIsLoading: Dispatch<SetStateAction<boolean>>
): Promise<void> => {
  try {
    setIsLoading(true);
    console.log('Beginning auth initialization');
    
    // First, set a reliable initial state
    setAuthState({
      isAuthenticated: false,
      userType: null,
      userId: null
    });
    
    // Then, try to recover from localStorage
    const storedAuthState = localStorage.getItem('authState');
    if (storedAuthState) {
      try {
        const parsedState = JSON.parse(storedAuthState);
        
        let safeUserType: 'developer' | 'client' | null = null;
        if (parsedState.userType === 'developer') safeUserType = 'developer';
        else if (parsedState.userType === 'client') safeUserType = 'client';
        
        const safeState: AuthState = {
          isAuthenticated: !!parsedState.isAuthenticated,
          userId: parsedState.userId || null,
          userType: safeUserType
        };
        
        setAuthState(safeState);
        console.log('Loaded initial auth state from localStorage:', safeState);
      } catch (error) {
        console.error('Error parsing stored auth state:', error);
        localStorage.removeItem('authState');
      }
    }
    
    // Then check Supabase session with timeout handling
    if (supabase) {
      try {
        // Create a timeout promise
        const timeoutPromise = new Promise<null>((resolve) => {
          setTimeout(() => {
            console.warn('Supabase auth check timed out');
            resolve(null);
          }, 5000); // 5 second timeout - reduced from 8s to fail faster
        });
        
        // Race between the actual check and the timeout
        const authCheckPromise = checkSupabaseSession(setAuthState);
        await Promise.race([authCheckPromise, timeoutPromise]);
      } catch (error) {
        console.error('Error checking Supabase session:', error);
      }
    } else {
      console.warn('Supabase client not initialized');
    }
  } catch (error) {
    console.error('Fatal error checking session:', error);
    // Fallback to logged out state to ensure app can start
    setAuthState({
      isAuthenticated: false,
      userType: null,
      userId: null
    });
    toast.error('Error initializing authentication. Please refresh the page.');
  } finally {
    setIsLoading(false);
    console.log('Auth initialization complete');
  }
};
