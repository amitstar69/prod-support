
import { supabase } from '../../../integrations/supabase/client';
import { toast } from 'sonner';
import { Developer, Client } from '../../../types/product';

/**
 * Register a user with Supabase
 */
export const registerWithSupabase = async (
  userData: Partial<Developer | Client>,
  userType: 'developer' | 'client'
): Promise<{ success: boolean; userId?: string; error?: string; emailVerificationSent?: boolean }> => {
  if (!userData.email || !userData.password) {
    console.error('Registration failed: Email and password are required');
    return { success: false, error: 'Email and password are required' };
  }
  
  try {
    console.log('Registering with Supabase', {
      email: userData.email,
      userType,
      name: userData.name,
      hasPassword: !!userData.password
    });
    
    // Extract firstName and lastName for metadata
    const firstName = (userData as any).firstName || '';
    const lastName = (userData as any).lastName || '';
    
    // First create auth user
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          user_type: userType,
          name: userData.name,
          first_name: firstName,
          last_name: lastName
        }
      }
    });
    
    console.log('Supabase signUp response:', { data, error });
    
    if (error) {
      console.error('Supabase registration error:', error);
      return { success: false, error: error.message };
    }
    
    if (!data.user) {
      console.error('No user data returned from Supabase');
      return { success: false, error: 'No user data returned' };
    }

    // Check if email confirmation is needed based on Supabase settings
    // If emailConfirm is true, it means the user needs to verify their email
    const emailVerificationSent = !!data.session === false && data.user.email_confirmed_at === null;
    
    console.log('User created in Auth system with ID:', data.user.id);
    console.log('Email verification status:', emailVerificationSent ? 'Verification required' : 'No verification required');
    
    // Need to wait a bit for auth to fully process
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      userId: data.user.id,
      emailVerificationSent
    };
  } catch (error: any) {
    console.error('Supabase registration exception:', error);
    return { 
      success: false, 
      error: error.message || 'Registration failed with an unexpected error'
    };
  }
};
