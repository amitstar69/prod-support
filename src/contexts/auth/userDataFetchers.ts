
import { supabase } from '../../integrations/supabase/client';
import { Developer, Client } from '../../types/product';

// Helper function to fetch user data
export const fetchUserData = async (userType: string | null, userId: string | null): Promise<Developer | Client | null> => {
  if (!userId || !userType) {
    console.error('fetchUserData called without userId or userType');
    return null;
  }

  console.log(`fetchUserData: Fetching data for ${userType} with ID ${userId}`);
  
  try {
    // First get the base profile data
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (profileError) {
      console.error('Error fetching profile data from Supabase:', profileError);
      throw profileError;
    }
    
    if (!profileData) {
      console.error('No profile data found');
      return null;
    }
    
    console.log('Base profile data fetched successfully:', profileData);
    
    // Get the type-specific profile data
    if (userType === 'developer') {
      return await fetchDeveloperProfile(userId, profileData);
    } else {
      return await fetchClientProfile(userId, profileData);
    }
  } catch (error) {
    console.error('Exception in fetchUserData:', error);
    throw error;
  }
};

// Function to fetch developer profile
const fetchDeveloperProfile = async (userId: string | null, profileData: any): Promise<Developer | null> => {
  try {
    const { data: devProfileData, error: devProfileError } = await supabase
      .from('developer_profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (devProfileError) {
      console.error('Error fetching developer profile data:', devProfileError);
      throw devProfileError;
    }
    
    if (!devProfileData) {
      console.error('No developer profile data found');
      return null;
    }
    
    console.log('Developer profile data fetched successfully:', devProfileData);
    
    // Combine the data for a Developer
    return {
      ...profileData,
      ...devProfileData,
      // Handle naming differences between DB and TypeScript interfaces
      hourlyRate: devProfileData.hourly_rate,
      minuteRate: devProfileData.minute_rate,
      preferredWorkingHours: profileData.preferred_working_hours,
      lastActive: devProfileData.last_active,
      communicationPreferences: devProfileData.communication_preferences,
      profileCompleted: profileData.profile_completed,
      // Map the new fields from snake_case to camelCase
      portfolioItems: devProfileData.portfolio_items,
      languagesSpoken: devProfileData.languages_spoken
    } as Developer;
  } catch (error) {
    console.error('Exception in fetchDeveloperProfile:', error);
    throw error;
  }
};

// Function to fetch client profile
const fetchClientProfile = async (userId: string | null, profileData: any): Promise<Client | null> => {
  try {
    console.log('Fetching client profile for:', userId);
    
    const { data: clientProfileData, error: clientProfileError } = await supabase
      .from('client_profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (clientProfileError) {
      console.error('Error fetching client profile data:', clientProfileError);
      throw clientProfileError;
    }
    
    if (!clientProfileData) {
      console.error('No client profile data found');
      return null;
    }
    
    console.log('Client profile data fetched successfully:', clientProfileData);
    
    // Create a clean client object without circular references
    const client: Client = {
      ...profileData,
      // Map snake_case DB fields to camelCase TS interface fields
      lookingFor: clientProfileData.looking_for || [],
      completedProjects: clientProfileData.completed_projects || 0,
      profileCompletionPercentage: clientProfileData.profile_completion_percentage || 0,
      preferredWorkingHours: profileData.preferred_working_hours || '',
      profileCompleted: profileData.profile_completed || false,
      preferredHelpFormat: clientProfileData.preferred_help_format || [],
      budgetPerHour: clientProfileData.budget_per_hour || 0,
      paymentMethod: clientProfileData.payment_method || 'Stripe',
      techStack: clientProfileData.tech_stack || [],
      projectTypes: clientProfileData.project_types || [],
      bio: clientProfileData.bio || '',
      company: clientProfileData.company || '',
      position: clientProfileData.position || '',
      industry: clientProfileData.industry || '',
      socialLinks: clientProfileData.social_links || {},
      timeZone: clientProfileData.time_zone,
      communicationPreferences: clientProfileData.communication_preferences || []
    };
    
    return client;
  } catch (error) {
    console.error('Exception in fetchClientProfile:', error);
    throw error;
  }
};
