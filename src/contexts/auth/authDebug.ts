
import { supabase } from '../../integrations/supabase/client';

// Debug function to check if a profile exists
export const debugCheckProfileExists = async (userId: string): Promise<{exists: boolean, error?: string, profileData?: any, typeProfileExists?: boolean, typeProfileData?: any, typeProfileError?: any}> => {
  if (!supabase) {
    console.error('Supabase client not initialized');
    return { exists: false, error: 'Supabase client not initialized' };
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, user_type')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error checking profile:', error.message);
      return { exists: false, error: error.message };
    }
    
    // If profile exists, also check for type-specific profile
    if (data) {
      const { data: typeProfileData, error: typeProfileError } = data.user_type === 'developer' 
        ? await supabase.from('developer_profiles').select('*').eq('id', userId).single()
        : await supabase.from('client_profiles').select('*').eq('id', userId).single();
        
      return { 
        exists: true, 
        profileData: data,
        typeProfileExists: !!typeProfileData,
        typeProfileData,
        typeProfileError: typeProfileError?.message
      };
    }
    
    return { exists: false };
  } catch (error: any) {
    console.error('Exception checking profile:', error);
    return { exists: false, error: error.message };
  }
};

// Debug function to create a profile
export const debugCreateProfile = async (
  userId: string, 
  userType: 'developer' | 'client',
  email: string,
  name?: string
): Promise<{success: boolean, error?: string, baseProfileCreated?: boolean, typeProfileCreated?: boolean, profileData?: any, typeProfileData?: any}> => {
  if (!supabase) {
    console.error('Supabase client not initialized');
    return { success: false, error: 'Supabase client not initialized' };
  }

  try {
    console.log(`Creating profile for user ID: ${userId}, type: ${userType}`);
    
    // Create base profile with correctly typed properties
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        user_type: userType,
        email: email,
        name: name || email.split('@')[0],
        image: '/placeholder.svg',
        profile_completed: false,
        username: (name || email.split('@')[0]).toLowerCase().replace(/\s+/g, ''),
        joined_date: new Date().toISOString()
      })
      .select();
    
    if (profileError) {
      console.error('Error creating base profile:', profileError.message);
      return { success: false, error: profileError.message };
    }
    
    // Create type-specific profile
    const tableName = userType === 'developer' ? 'developer_profiles' : 'client_profiles';
    const { data: typeProfileData, error: typeProfileError } = await supabase
      .from(tableName)
      .insert({
        id: userId,
      })
      .select();
    
    if (typeProfileError) {
      console.error(`Error creating ${userType} profile:`, typeProfileError.message);
      return { 
        success: true, 
        baseProfileCreated: true,
        typeProfileCreated: false,
        profileData,
        error: typeProfileError.message 
      };
    }
    
    return { 
      success: true, 
      baseProfileCreated: true,
      typeProfileCreated: true,
      profileData,
      typeProfileData
    };
  } catch (error: any) {
    console.error('Exception creating profile:', error);
    return { success: false, error: error.message };
  }
};
