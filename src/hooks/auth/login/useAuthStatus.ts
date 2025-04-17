
import { useCallback } from 'react';
import { supabase } from '../../../integrations/supabase/client';

export const useAuthStatus = () => {
  const checkAuthStatus = useCallback(async () => {
    try {
      const { data } = await supabase.auth.getSession();
      console.log('Current auth status:', { session: data.session });
      return !!data.session;
    } catch (error) {
      console.error('Error checking auth status:', error);
      return false;
    }
  }, []);

  const handleResendVerification = useCallback(async (email: string) => {
    if (!email) {
      throw new Error('Please enter your email address first');
    }
    
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    });
    
    if (error) {
      console.error('Error resending verification:', error);
      throw error;
    }
  }, []);

  return {
    checkAuthStatus,
    handleResendVerification
  };
};
