
import { supabase } from '../../integrations/supabase/client';

export const debugCheckProfileExists = async (userId: string): Promise<boolean> => {
  if (!userId) {
    console.error('debugCheckProfileExists: No userId provided');
    return false;
  }
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();
      
    if (error) {
      console.error('debugCheckProfileExists error:', error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error('Exception in debugCheckProfileExists:', error);
    return false;
  }
};

export const debugCreateProfile = async (userId: string, userType: 'developer' | 'client', email?: string): Promise<boolean> => {
  if (!userId) {
    console.error('debugCreateProfile: No userId provided');
    return false;
  }
  
  try {
    // Generate default profile data
    const profileData = {
      id: userId,
      user_type: userType,
      name: 'New User',
      email: email || `user_${userId.slice(0, 8)}@example.com`,
      description: '',
      image: '/placeholder.svg'
    };
    
    const { error } = await supabase
      .from('profiles')
      .insert([profileData]);
      
    if (error) {
      console.error('debugCreateProfile error:', error);
      return false;
    }
    
    console.log('Debug profile created successfully:', profileData);
    return true;
  } catch (error) {
    console.error('Exception in debugCreateProfile:', error);
    return false;
  }
};
