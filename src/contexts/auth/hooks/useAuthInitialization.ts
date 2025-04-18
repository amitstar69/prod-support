
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
    console.time('auth-initialization');
    
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
    
    // Set a maximum timeout for the entire auth initialization process - increased from 5s to 10s
    const authTimeoutPromise = new Promise<void>((resolve) => {
      setTimeout(() => {
        console.warn('Auth initialization global timeout reached');
        setIsLoading(false);
        resolve();
      }, 10000); // Increased from 5s to 10s global timeout
    });
    
    // Race between the actual check and the global timeout
    await Promise.race([
      (async () => {
        // Then check Supabase session with timeout handling
        if (supabase) {
          try {
            // Create a timeout promise - increased from 3s to 7s
            const timeoutPromise = new Promise<null>((resolve) => {
              setTimeout(() => {
                console.warn('Supabase auth check timed out');
                resolve(null);
              }, 7000); // Increased from 3s to 7s for slower networks
            });
            
            // Race between the actual check and the timeout
            const sessionPromise = checkSupabaseSession(setAuthState);
            await Promise.race([sessionPromise, timeoutPromise]);
          } catch (error) {
            console.error('Error checking Supabase session:', error);
          }
        } else {
          console.warn('Supabase client not initialized');
        }
        setIsLoading(false);
      })(),
      authTimeoutPromise
    ]);
    
    console.timeEnd('auth-initialization');
  } catch (error) {
    console.error('Fatal error checking session:', error);
    // Fallback to logged out state to ensure app can start
    setAuthState({
      isAuthenticated: false,
      userType: null,
      userId: null
    });
    setIsLoading(false);
    toast.error('Error initializing authentication. Please refresh the page.');
  }
};
