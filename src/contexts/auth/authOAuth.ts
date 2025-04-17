
import { supabase } from '../../integrations/supabase/client';
import { OAuthProvider, UserType } from './types';
import { toast } from 'sonner';
import { LoginResult } from './authLogin';

export const loginWithOAuth = async (
  provider: OAuthProvider,
  userType: UserType
): Promise<LoginResult> => {
  try {
    console.log(`Attempting OAuth login with ${provider} as ${userType}`);
    
    // Store the userType in localStorage so we can retrieve it after redirect
    localStorage.setItem('pendingOAuthUserType', userType);
    
    // Construct options with the user type in the metadata
    const options = {
      redirectTo: `${window.location.origin}/login`,
      queryParams: {
        userType: userType // Pass userType as a query param
      },
      // Store user type in provider's metadata
      data: {
        user_type: userType,
        registration_source: `oauth_${provider}`
      }
    };

    // Execute the OAuth sign in
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options
    });

    if (error) {
      console.error('OAuth login error:', error);
      return {
        success: false,
        error: error.message
      };
    }

    // Check if redirection was initiated successfully
    if (!data) {
      console.error('No data returned from OAuth attempt');
      return {
        success: false,
        error: 'Failed to initiate login with provider'
      };
    }

    // On success, Supabase will redirect the user to the callback URL
    // We'll handle the redirect and check auth state in the callback
    return { 
      success: true,
      // Note: actual success will be determined after the redirect
    };
  } catch (error: any) {
    console.error('Exception during OAuth login:', error);
    
    return {
      success: false,
      error: error.message || `An unexpected error occurred during ${provider} login`
    };
  }
};

// Function to get and clear the pending OAuth user type
export const getPendingOAuthUserType = (): UserType | null => {
  const userType = localStorage.getItem('pendingOAuthUserType') as UserType | null;
  if (userType) {
    localStorage.removeItem('pendingOAuthUserType');
  }
  return userType;
};

// Function to handle the OAuth callback 
export const handleOAuthCallback = async (): Promise<{
  success: boolean;
  userType?: UserType | null;
  error?: string;
}> => {
  try {
    // Check if we have a session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Error checking session after OAuth:', sessionError);
      return {
        success: false,
        error: sessionError.message
      };
    }
    
    if (!sessionData.session) {
      console.log('No session found after OAuth callback');
      return {
        success: false,
        error: 'Authentication failed. Please try again.'
      };
    }
    
    // Get user details
    const user = sessionData.session.user;
    
    // Check if the user has a profile, if not, we need to create one
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('user_type, id')
      .eq('id', user.id)
      .single();
    
    // Get the pending user type from localStorage (set before redirect)
    const pendingUserType = getPendingOAuthUserType();
    
    if (profileError) {
      // Profile doesn't exist - create one with the pending user type
      if (pendingUserType) {
        const { error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            user_type: pendingUserType,
            email: user.email,
            name: user.user_metadata.name || user.user_metadata.full_name || user.email?.split('@')[0] || 'User',
          });
          
        if (createError) {
          console.error('Failed to create user profile after OAuth:', createError);
          return {
            success: false,
            error: 'Failed to complete account setup'
          };
        }
        
        return {
          success: true,
          userType: pendingUserType
        };
      } else {
        console.error('No user type specified for OAuth signup');
        return {
          success: false,
          error: 'Failed to determine account type'
        };
      }
    }
    
    // Profile exists - check if user type matches
    if (pendingUserType && profileData.user_type !== pendingUserType) {
      console.warn('User attempting to login with different user type', {
        existing: profileData.user_type,
        attempted: pendingUserType
      });
      
      // Sign out - wrong user type
      await supabase.auth.signOut();
      return {
        success: false,
        error: `This account is already registered as a ${profileData.user_type}. Please use the correct login option.`
      };
    }
    
    return {
      success: true,
      userType: profileData.user_type
    };
  } catch (error: any) {
    console.error('Error in OAuth callback handler:', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred while completing authentication'
    };
  }
};
