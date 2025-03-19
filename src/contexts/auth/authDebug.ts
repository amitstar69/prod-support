
import { supabase } from '../../integrations/supabase/client';

// Debug function to check if a profile exists
export const debugCheckProfileExists = async (userId: string): Promise<boolean> => {
  if (!supabase) {
    console.error('Supabase client not initialized');
    return false;
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error checking profile:', error.message);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error('Exception checking profile:', error);
    return false;
  }
};

// Debug function to create a profile
export const debugCreateProfile = async (
  userId: string, 
  userType: 'developer' | 'client',
  email: string
): Promise<boolean> => {
  if (!supabase) {
    console.error('Supabase client not initialized');
    return false;
  }

  try {
    // Create base profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        user_type: userType,
        email: email,
        created_at: new Date().toISOString(),
      });
    
    if (profileError) {
      console.error('Error creating base profile:', profileError.message);
      return false;
    }
    
    // Create type-specific profile
    const tableName = userType === 'developer' ? 'developer_profiles' : 'client_profiles';
    const { error: typeProfileError } = await supabase
      .from(tableName)
      .insert({
        id: userId,
      });
    
    if (typeProfileError) {
      console.error(`Error creating ${userType} profile:`, typeProfileError.message);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Exception creating profile:', error);
    return false;
  }
};
