
import { supabase } from './client';

// Add debugging functions to check profile creation
export const debugCheckProfileExists = async (userId: string) => {
  if (!userId) return { exists: false, error: 'No user ID provided' };
  
  try {
    console.log(`Checking if profile exists for user ID: ${userId}`);
    
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (profileError) {
      console.error('Error checking profile existence:', profileError);
      return { exists: false, error: profileError.message };
    }
    
    console.log('Profile data found:', profileData);
    
    // Check if user type specific profile exists
    if (profileData?.user_type) {
      const { data: typeProfileData, error: typeProfileError } = profileData.user_type === 'developer' 
        ? await supabase.from('developer_profiles').select('*').eq('id', userId).single()
        : await supabase.from('client_profiles').select('*').eq('id', userId).single();
        
      console.log(`${profileData.user_type}_profiles check results:`, {
        typeProfile: typeProfileData ? 'exists' : 'missing',
        typeProfileError: typeProfileError
      });
      
      return { 
        exists: !!profileData, 
        profileData,
        typeProfileExists: !!typeProfileData,
        typeProfileData,
        typeProfileError
      };
    }
    
    return { exists: !!profileData, profileData };
  } catch (error) {
    console.error('Exception checking profile:', error);
    return { exists: false, error: error.message };
  }
};

// Add the debugCreateProfile function
export const debugCreateProfile = async (userId: string, userType: string, email: string, name: string) => {
  if (!userId) return { success: false, error: 'No user ID provided' };
  
  try {
    console.log(`Creating profile for user ID: ${userId}, type: ${userType}`);
    
    // First, create the base profile record
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        user_type: userType,
        email: email,
        name: name,
        image: '/placeholder.svg',
        profile_completed: false,
        username: name.toLowerCase().replace(/\s+/g, '')
      })
      .select()
      .single();
      
    if (profileError) {
      console.error('Error creating base profile:', profileError);
      return { success: false, error: profileError.message };
    }
    
    console.log('Base profile created:', profileData);
    
    // Next, create the type-specific profile record
    let typeProfileData, typeProfileError;
    
    if (userType === 'developer') {
      const { data, error } = await supabase
        .from('developer_profiles')
        .insert({
          id: userId,
          category: 'frontend',
          skills: ['JavaScript', 'React'],
          hourly_rate: 75,
          minute_rate: 1.5,
          experience: '3+ years',
          availability: true,
          rating: 4.5,
          communication_preferences: ['chat', 'video']
        })
        .select()
        .single();
        
      typeProfileData = data;
      typeProfileError = error;
    } else {
      const { data, error } = await supabase
        .from('client_profiles')
        .insert({
          id: userId,
          looking_for: ['web development'],
          preferred_help_format: ['chat'],
          tech_stack: ['React'],
          budget_per_hour: 75,
          payment_method: 'Stripe',
          communication_preferences: ['chat'],
          profile_completion_percentage: 30
        })
        .select()
        .single();
        
      typeProfileData = data;
      typeProfileError = error;
    }
    
    if (typeProfileError) {
      console.error(`Error creating ${userType} profile:`, typeProfileError);
      return { 
        success: true, 
        baseProfileCreated: true,
        typeProfileCreated: false,
        profileData,
        error: typeProfileError.message 
      };
    }
    
    console.log(`${userType} profile created:`, typeProfileData);
    
    return { 
      success: true, 
      baseProfileCreated: true,
      typeProfileCreated: true,
      profileData,
      typeProfileData
    };
  } catch (error) {
    console.error('Exception creating profile:', error);
    return { success: false, error: error.message };
  }
};
