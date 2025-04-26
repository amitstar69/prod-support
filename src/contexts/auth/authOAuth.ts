
import { supabase } from '../../integrations/supabase/client';
import { OAuthProvider, UserType } from './types';
import { LoginResult } from './authLogin';

export const loginWithOAuth = async (
  provider: OAuthProvider,
  userType: UserType
): Promise<LoginResult> => {
  try {
    console.log(`Starting OAuth login with ${provider} as ${userType}`);
    
    // Store the user type in session storage to retrieve it after redirect
    sessionStorage.setItem('oauthUserType', userType);
    
    // Configure OAuth providers
    const providerOptions = {
      provider: provider,
      options: {
        redirectTo: window.location.origin + '/login?from=oauth',
        // We store user type as a query parameter to retrieve it after redirect
        queryParams: {
          user_type: userType
        }
      }
    };
    
    // Initiate the OAuth flow
    const { data, error } = await supabase.auth.signInWithOAuth(providerOptions);
    
    // If there's an error initiating the OAuth flow
    if (error) {
      console.error('OAuth error:', error);
      return {
        success: false,
        error: error.message || `Failed to sign in with ${provider}`
      };
    }
    
    // If we got here, the OAuth flow was initiated successfully
    // The browser will redirect to the provider's login page
    console.log('OAuth flow initiated successfully, awaiting redirect');
    
    return {
      success: true
    };
  } catch (error: any) {
    console.error('OAuth exception:', error);
    return {
      success: false,
      error: error.message || `An unexpected error occurred during ${provider} authentication`
    };
  }
};

// Handle the OAuth callback - this will be called after the user is redirected back
export const handleOAuthCallback = async (): Promise<LoginResult> => {
  try {
    // Get the current session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !sessionData.session) {
      console.error('OAuth callback error - No session:', sessionError);
      return {
        success: false,
        error: sessionError?.message || 'Authentication failed. No session found after OAuth login.'
      };
    }
    
    // Get user type from session storage (set before the OAuth redirect)
    const userType = sessionStorage.getItem('oauthUserType') as UserType || 'client';
    
    // Get the user ID from the session
    const userId = sessionData.session.user.id;
    
    // Check if profile exists
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', userId)
      .single();
    
    // If profile doesn't exist, create it
    if (profileError && profileError.code === 'PGRST116') {
      // Create a new profile with the user type
      const { error: createError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          user_type: userType,
          name: sessionData.session.user.user_metadata.full_name || 
                sessionData.session.user.user_metadata.name || 
                sessionData.session.user.email?.split('@')[0] || 
                'User',
          email: sessionData.session.user.email
        });
      
      if (createError) {
        console.error('Error creating profile after OAuth:', createError);
        await supabase.auth.signOut();
        return {
          success: false,
          error: 'Failed to create your user profile after OAuth login.'
        };
      }
      
      console.log('Created new profile after OAuth login');
      return {
        success: true,
        userId: userId
      };
    } 
    
    // If there was an error fetching the profile that's not a "not found" error
    if (profileError) {
      console.error('Error fetching profile after OAuth login:', profileError);
      return {
        success: false,
        error: 'Error retrieving your profile after authentication.'
      };
    }
    
    // Check if user type matches
    if (profileData && profileData.user_type !== userType) {
      console.error('User type mismatch after OAuth login:', profileData.user_type, 'vs', userType);
      await supabase.auth.signOut();
      return {
        success: false,
        error: `You are registered as a ${profileData.user_type}, not a ${userType}. Please use the correct login option.`
      };
    }
    
    return {
      success: true,
      userId: userId
    };
  } catch (error: any) {
    console.error('OAuth callback exception:', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred while completing authentication.'
    };
  }
};
