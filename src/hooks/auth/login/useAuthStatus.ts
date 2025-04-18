
import { useCallback } from 'react';
import { supabase } from '../../../integrations/supabase/client';
import { toast } from 'sonner';

export const useAuthStatus = () => {
  const checkAuthStatus = useCallback(async () => {
    try {
      // Add timeout handling for auth check
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        console.warn('Auth status check timed out after 5 seconds');
      }, 5000);
      
      // Create timeout promise
      const timeoutPromise = new Promise<boolean>((resolve) => {
        controller.signal.addEventListener('abort', () => {
          console.warn('Auth status check aborted due to timeout');
          resolve(false); // Resolve as not authenticated on timeout
        });
      });
      
      // Create auth check promise
      const authCheckPromise = new Promise<boolean>(async (resolve) => {
        try {
          const { data } = await supabase.auth.getSession();
          console.log('Current auth status:', { session: data.session });
          resolve(!!data.session);
        } catch (error) {
          console.error('Error checking auth status:', error);
          resolve(false);
        }
      });
      
      // Race between auth check and timeout
      const result = await Promise.race([authCheckPromise, timeoutPromise]);
      clearTimeout(timeoutId);
      return result;
    } catch (error) {
      console.error('Error checking auth status:', error);
      return false;
    }
  }, []);

  const handleResendVerification = useCallback(async (email: string) => {
    if (!email) {
      throw new Error('Please enter your email address first');
    }
    
    try {
      // Add timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        console.warn('Resend verification timed out after 8 seconds');
      }, 8000);
      
      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        controller.signal.addEventListener('abort', () => {
          reject(new Error('Request timed out. Please try again.'));
        });
      });
      
      // Create resend promise
      const resendPromise = supabase.auth.resend({
        type: 'signup',
        email: email,
      });
      
      // Race between resend and timeout
      const { error } = await Promise.race([resendPromise, timeoutPromise]) as {error: any};
      clearTimeout(timeoutId);
      
      if (error) {
        console.error('Error resending verification:', error);
        toast.error(`Failed to resend: ${error.message}`);
        throw error;
      }
      
      toast.success('Verification email sent! Please check your inbox.');
    } catch (error: any) {
      console.error('Error in resend verification:', error);
      if (error.name === 'AbortError' || error.message?.includes('timed out')) {
        toast.error('Request timed out. Please check your internet connection.');
        throw new Error('Request timed out. Please try again.');
      }
      toast.error('Failed to resend verification email');
      throw error;
    }
  }, []);

  return {
    checkAuthStatus,
    handleResendVerification
  };
};
