
import { supabase } from '../../../integrations/supabase/client';
import { toast } from 'sonner';
import { Developer, Client } from '../../../types/product';

/**
 * Create a base profile for a user
 */
export const createUserProfile = async (
  userId: string,
  userData: Partial<Developer | Client>,
  userType: 'developer' | 'client'
): Promise<boolean> => {
  try {
    const profileData = {
      id: userId,
      user_type: userType,
      name: userData.name || '',
      email: userData.email,
      image: userData.image || '/placeholder.svg',
      description: userData.description || '',
      location: userData.location || '',
      joined_date: new Date().toISOString(),
      languages: userData.languages || [],
      preferred_working_hours: userData.preferredWorkingHours || '',
      profile_completed: userData.profileCompleted || false,
      username: (userData as any).username || `user_${Date.now()}`,
    };
    
    console.log('Creating profile record with data:', profileData);
    
    // Insert profile with proper error handling
    const { error: profileError, data: profileInsertData } = await supabase
      .from('profiles')
      .insert([profileData])
      .select();
    
    if (profileError) {
      console.error('Error creating profile:', profileError);
      toast.error('Error creating profile: ' + profileError.message);
      
      // Attempt direct insert with more debugging
      console.log('Attempting alternative profile creation approach...');
      const { error: altProfileError } = await supabase
        .from('profiles')
        .insert([{
          id: userId,
          user_type: userType,
          name: userData.name || 'User',
          email: userData.email
        }]);
        
      if (altProfileError) {
        console.error('Alternative profile creation also failed:', altProfileError);
        return false;
      }
    } else {
      console.log('Profile created successfully:', profileInsertData);
    }
    
    return true;
  } catch (error: any) {
    console.error('Exception during profile creation:', error);
    return false;
  }
};

/**
 * Create a developer-specific profile
 */
export const createDeveloperProfile = async (
  userId: string,
  userData: Partial<Developer>
): Promise<boolean> => {
  try {
    const developerProfileData = {
      id: userId,
      hourly_rate: userData.hourlyRate || 75,
      minute_rate: userData.minuteRate || 1.5,
      category: userData.category || 'frontend',
      skills: userData.skills || ['JavaScript', 'React'],
      experience: userData.experience || '3+ years',
      rating: userData.rating || 4.5,
      availability: typeof userData.availability === 'boolean' 
        ? userData.availability 
        : true,
      featured: userData.featured || false,
      online: userData.online || false,
      last_active: new Date().toISOString(),
      phone: userData.phone || null,
      communication_preferences: userData.communicationPreferences || ['chat', 'video'],
    };
    
    console.log('Creating developer profile with data:', developerProfileData);
    
    const { error: devProfileError, data: devProfileData } = await supabase
      .from('developer_profiles')
      .insert(developerProfileData)
      .select();
    
    if (devProfileError) {
      console.error('Error creating developer profile:', devProfileError);
      toast.error('Error creating developer profile: ' + devProfileError.message);
      // Try simplified insertion
      const { error: simpleDevProfileError } = await supabase
        .from('developer_profiles')
        .insert([{ id: userId }]);
        
      if (simpleDevProfileError) {
        console.error('Simple developer profile insertion also failed:', simpleDevProfileError);
        return false;
      }
    } else {
      console.log('Developer profile created successfully:', devProfileData);
    }
    
    return true;
  } catch (error) {
    console.error('Exception during developer profile creation:', error);
    return false;
  }
};

/**
 * Create a client-specific profile
 */
export const createClientProfile = async (
  userId: string,
  userData: Partial<Client>
): Promise<boolean> => {
  try {
    const clientProfileData = {
      id: userId,
      looking_for: userData.lookingFor || ['web development'],
      completed_projects: userData.completedProjects || 0,
      profile_completion_percentage: userData.profileCompletionPercentage || 0,
      preferred_help_format: userData.preferredHelpFormat || ['chat'],
      budget: userData.budget || null,
      payment_method: userData.paymentMethod || 'Stripe',
      bio: userData.bio || null,
      tech_stack: userData.techStack || ['React'],
      budget_per_hour: userData.budgetPerHour || 75,
      company: userData.company || null,
      position: userData.position || null,
      project_types: userData.projectTypes || [],
      industry: userData.industry || null,
      social_links: userData.socialLinks || {},
      time_zone: userData.timeZone || null,
      availability: userData.availability || {},
      communication_preferences: userData.communicationPreferences || ['chat'],
    };
    
    console.log('Creating client profile with data:', clientProfileData);
    
    const { error: clientProfileError, data: clientProfileInsertData } = await supabase
      .from('client_profiles')
      .insert([clientProfileData])
      .select();
    
    if (clientProfileError) {
      console.error('Error creating client profile:', clientProfileError);
      toast.error('Error creating client profile: ' + clientProfileError.message);
      // Try simplified insertion
      const { error: simpleClientProfileError } = await supabase
        .from('client_profiles')
        .insert([{ id: userId }]);
        
      if (simpleClientProfileError) {
        console.error('Simple client profile insertion also failed:', simpleClientProfileError);
        return false;
      }
    } else {
      console.log('Client profile created successfully:', clientProfileInsertData);
    }
    
    return true;
  } catch (error) {
    console.error('Exception during client profile creation:', error);
    return false;
  }
};
