
import { supabase } from '../../integrations/supabase/client';
import { Developer, Client } from '../../types/product';

type UserData = Partial<Developer | Client>;

// Function to update user data
export const updateUserData = async (userData: UserData): Promise<boolean> => {
  // First check if we have auth state
  const authStateStr = localStorage.getItem('authState');
  if (!authStateStr) {
    console.error('No auth state found in localStorage');
    return false;
  }
  
  const { isAuthenticated, userType, userId } = JSON.parse(authStateStr);
  
  if (!isAuthenticated || !userId) {
    console.error('User not authenticated or missing userId');
    return false;
  }
  
  try {
    // Prepare profile data with type safety
    const profileData: any = {
      name: userData.name,
      email: userData.email,
      image: userData.image,
      location: userData.location,
      description: userData.description,
      profile_completed: userData.profileCompleted,
      profile_completion_percentage: userData.profileCompletionPercentage,
    };
    
    // Add properties that might exist on either type
    if ('username' in userData) profileData.username = userData.username;
    if ('bio' in userData) profileData.bio = userData.bio;
    if ('onboardingCompletedAt' in userData) profileData.onboarding_completed_at = userData.onboardingCompletedAt;
    
    // Update the basic profile data first
    const { error: profileError } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', userId);
      
    if (profileError) {
      console.error('Error updating profile in Supabase:', profileError);
      return updateUserDataInLocalStorage(userType, userId, userData);
    }
    
    // Now update the type-specific profile data
    if (userType === 'developer') {
      const devData: any = {};
      
      // Add developer-specific properties safely
      if ('category' in userData) devData.category = userData.category;
      if ('skills' in userData) devData.skills = userData.skills;
      if ('hourlyRate' in userData) devData.hourly_rate = userData.hourlyRate;
      if ('minuteRate' in userData) devData.minute_rate = userData.minuteRate;
      if ('experience' in userData) devData.experience = userData.experience;
      if ('availability' in userData) devData.availability = userData.availability;
      if ('communicationPreferences' in userData) devData.communication_preferences = userData.communicationPreferences;
      
      const { error: devProfileError } = await supabase
        .from('developer_profiles')
        .update(devData)
        .eq('id', userId);
        
      if (devProfileError) {
        console.error('Error updating developer profile in Supabase:', devProfileError);
        return updateUserDataInLocalStorage(userType, userId, userData);
      }
    } else if (userType === 'client') {
      const clientData: any = {};
      
      // Add client-specific properties safely
      if ('lookingFor' in userData) clientData.looking_for = userData.lookingFor;
      if ('preferredHelpFormat' in userData) clientData.preferred_help_format = userData.preferredHelpFormat;
      if ('techStack' in userData) clientData.tech_stack = userData.techStack;
      if ('budgetPerHour' in userData) clientData.budget_per_hour = userData.budgetPerHour;
      if ('paymentMethod' in userData) clientData.payment_method = userData.paymentMethod;
      if ('communicationPreferences' in userData) clientData.communication_preferences = userData.communicationPreferences;
      if ('industry' in userData) clientData.industry = userData.industry;
      if ('projectTypes' in userData) clientData.project_types = userData.projectTypes;
      if ('company' in userData) clientData.company = userData.company;
      if ('position' in userData) clientData.position = userData.position;
      
      const { error: clientProfileError } = await supabase
        .from('client_profiles')
        .update(clientData)
        .eq('id', userId);
        
      if (clientProfileError) {
        console.error('Error updating client profile in Supabase:', clientProfileError);
        return updateUserDataInLocalStorage(userType, userId, userData);
      }
    }
    
    console.log('User data updated successfully in Supabase');
    return true;
  } catch (error) {
    console.error('Exception updating user data in Supabase:', error);
    return updateUserDataInLocalStorage(userType, userId, userData);
  }
};

// Helper to update user data in localStorage (as fallback)
export const updateUserDataInLocalStorage = (
  userType: string | null, 
  userId: string | null, 
  userData: UserData
): boolean => {
  try {
    if (userType === 'developer') {
      const developers = JSON.parse(localStorage.getItem('mockDevelopers') || '[]');
      const updatedDevelopers = developers.map((dev: Developer) => {
        if (dev.id === userId) {
          return { ...dev, ...userData };
        }
        return dev;
      });
      localStorage.setItem('mockDevelopers', JSON.stringify(updatedDevelopers));
    } else if (userType === 'client') {
      const clients = JSON.parse(localStorage.getItem('mockClients') || '[]');
      const updatedClients = clients.map((client: Client) => {
        if (client.id === userId) {
          return { ...client, ...userData };
        }
        return client;
      });
      localStorage.setItem('mockClients', JSON.stringify(updatedClients));
    } else {
      return false;
    }
    console.log('User data updated in localStorage');
    return true;
  } catch (error) {
    console.error('Error updating user data in localStorage:', error);
    return false;
  }
};
