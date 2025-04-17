
import { Dispatch, SetStateAction } from 'react';
import { AuthState } from '../types';
import { supabase } from '../../../integrations/supabase/client';
import { checkSupabaseSession } from '../authUtils';

export const initializeAuthState = async (
  setAuthState: Dispatch<SetStateAction<AuthState>>,
  setIsLoading: Dispatch<SetStateAction<boolean>>
): Promise<void> => {
  try {
    setIsLoading(true);
    
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
    
    if (supabase) {
      const authData = await checkSupabaseSession(setAuthState);
      console.log('Supabase auth check result:', authData);
    }
  } catch (error) {
    console.error('Error checking session:', error);
  } finally {
    setIsLoading(false);
  }
};
