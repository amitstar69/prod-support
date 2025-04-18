
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAuthStatus = () => {
  /**
   * Check the current authentication status
   * @returns Promise that resolves to a boolean indicating if user is authenticated
   */
  const checkAuthStatus = useCallback(async (): Promise<boolean> => {
    try {
      // Create AbortController for timeout
      const controller = new AbortController();
      
      // Set timeout to 5 seconds (reduced from standard 8s)
      const timeoutId = setTimeout(() => {
        controller.abort();
        console.warn('Auth status check timed out after 5 seconds');
      }, 5000);
      
      // Get current session with timeout
      const sessionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise((_, reject) => {
        controller.signal.addEventListener('abort', () => {
          reject(new Error('Auth status check timed out'));
        });
      });
      
      // Race between session fetch and timeout
      const { data } = await Promise.race([
        sessionPromise,
        timeoutPromise,
      ]) as { data: { session: any } };
      
      clearTimeout(timeoutId);
      return !!data.session;
    } catch (error) {
      console.warn('Auth status check aborted due to timeout');
      // If timed out or failed, assume not authenticated for safety
      return false;
    }
  }, []);

  /**
   * Resend verification email to user
   * @param email The email address to send verification to
   * @returns Promise that resolves when the verification is sent
   */
  const handleResendVerification = useCallback(async (email: string) => {
    if (!email) {
      throw new Error('Email is required to resend verification');
    }
    
    try {
      // Add timeout to avoid hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: window.location.origin + '/email-confirmed',
        }
      });
      
      clearTimeout(timeoutId);
      
      if (error) {
        console.error('Error resending verification:', error);
        throw error;
      }
      
      return true;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error('Verification request timed out. Please try again.');
      }
      throw error;
    }
  }, []);

  return {
    checkAuthStatus,
    handleResendVerification
  };
};
