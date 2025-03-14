
import { supabase } from '../../integrations/supabase/client';

// Debug function to check if a profile exists
export const debugCheckProfileExists = async (userId: string) => {
  if (!supabase) {
    return {
      exists: false,
      error: 'Supabase client not available'
    };
  }
  
  try {
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, user_type, email')
      .eq('id', userId)
      .single();
      
    if (profileError) {
      console.error('Error checking profile existence:', profileError);
      return {
        exists: false,
        error: profileError.message,
        details: profileError
      };
    }
    
    return {
      exists: !!profileData,
      profile: profileData
    };
  } catch (error) {
    console.error('Exception checking profile existence:', error);
    return {
      exists: false,
      error: error.message,
      exception: error
    };
  }
};

// Debug function to create a profile directly
export const debugCreateProfile = async (
  userId: string, 
  userType: 'developer' | 'client', 
  email: string, 
  name: string
) => {
  if (!supabase) {
    return {
      success: false,
      error: 'Supabase client not available'
    };
  }
  
  try {
    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();
      
    if (existingProfile) {
      return {
        success: true,
        message: 'Profile already exists',
        profile: existingProfile
      };
    }
    
    // Create basic profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert([{
        id: userId,
        user_type: userType,
        email: email,
        name: name,
        joined_date: new Date().toISOString(),
        profile_completed: false
      }])
      .select();
      
    if (profileError) {
      console.error('Error creating profile directly:', profileError);
      return {
        success: false,
        error: profileError.message,
        details: profileError
      };
    }
    
    // Create type-specific profile
    if (userType === 'developer') {
      const { error: devProfileError } = await supabase
        .from('developer_profiles')
        .insert([{
          id: userId,
          hourly_rate: 75,
          minute_rate: 1.5,
          category: 'frontend',
          skills: ['JavaScript', 'React'],
          experience: '3+ years',
          rating: 4.5,
          availability: true,
          featured: false,
          online: false,
          last_active: new Date().toISOString()
        }]);
        
      if (devProfileError) {
        console.error('Error creating developer profile directly:', devProfileError);
      }
    } else {
      const { error: clientProfileError } = await supabase
        .from('client_profiles')
        .insert([{
          id: userId,
          looking_for: ['web development'],
          completed_projects: 0,
          profile_completion_percentage: 30,
          preferred_help_format: ['chat'],
          budget_per_hour: 75,
          payment_method: 'Stripe',
          tech_stack: ['React']
        }]);
        
      if (clientProfileError) {
        console.error('Error creating client profile directly:', clientProfileError);
      }
    }
    
    return {
      success: true,
      profile: profileData ? profileData[0] : null
    };
  } catch (error) {
    console.error('Exception creating profile directly:', error);
    return {
      success: false,
      error: error.message,
      exception: error
    };
  }
};
