
import { supabase } from '../../integrations/supabase/client';
import { Developer, Client } from '../../types/product';

// Helper function to fetch user data
export const fetchUserData = async (userType: string | null, userId: string | null): Promise<Developer | Client | null> => {
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
  
  // Get the type-specific profile data
  if (userType === 'developer') {
    return await fetchDeveloperProfile(userId, profileData);
  } else {
    return await fetchClientProfile(userId, profileData);
  }
};

// Function to fetch developer profile
const fetchDeveloperProfile = async (userId: string | null, profileData: any): Promise<Developer | null> => {
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
    profileCompleted: profileData.profile_completed
  } as Developer;
};

// Function to fetch client profile
const fetchClientProfile = async (userId: string | null, profileData: any): Promise<Client | null> => {
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
  
  // Combine the data for a Client
  return {
    ...profileData,
    ...clientProfileData,
    // Handle naming differences between DB and TypeScript interfaces
    lookingFor: clientProfileData.looking_for,
    completedProjects: clientProfileData.completed_projects,
    profileCompletionPercentage: clientProfileData.profile_completion_percentage,
    preferredWorkingHours: profileData.preferred_working_hours,
    profileCompleted: profileData.profile_completed,
    preferredHelpFormat: clientProfileData.preferred_help_format,
    budgetPerHour: clientProfileData.budget_per_hour,
    paymentMethod: clientProfileData.payment_method,
    techStack: clientProfileData.tech_stack,
    projectTypes: clientProfileData.project_types,
    socialLinks: clientProfileData.social_links,
    timeZone: clientProfileData.time_zone,
    communicationPreferences: clientProfileData.communication_preferences
  } as Client;
};
