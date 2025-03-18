
import { supabase } from '../../integrations/supabase/client';
import { Developer, Client } from '../../types/product';

// Function to update user data
export const updateUserData = async (userData: Partial<Developer | Client>): Promise<boolean> => {
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
    // Update the basic profile data first
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        name: userData.name,
        email: userData.email,
        image: userData.image,
        username: userData.username,
        location: userData.location,
        description: userData.description,
        bio: userData.bio,
        profile_completed: userData.profileCompleted,
        profile_completion_percentage: userData.profileCompletionPercentage,
        onboarding_completed_at: userData.onboardingCompletedAt
      })
      .eq('id', userId);
      
    if (profileError) {
      console.error('Error updating profile in Supabase:', profileError);
      return updateUserDataInLocalStorage(userType, userId, userData);
    }
    
    // Now update the type-specific profile data
    if (userType === 'developer') {
      const { error: devProfileError } = await supabase
        .from('developer_profiles')
        .update({
          category: userData.category,
          skills: userData.skills,
          hourly_rate: userData.hourlyRate,
          minute_rate: userData.minuteRate,
          experience: userData.experience,
          availability: userData.availability,
          communication_preferences: userData.communicationPreferences
        })
        .eq('id', userId);
        
      if (devProfileError) {
        console.error('Error updating developer profile in Supabase:', devProfileError);
        return updateUserDataInLocalStorage(userType, userId, userData);
      }
    } else if (userType === 'client') {
      const { error: clientProfileError } = await supabase
        .from('client_profiles')
        .update({
          looking_for: userData.lookingFor,
          preferred_help_format: userData.preferredHelpFormat,
          tech_stack: userData.techStack,
          budget_per_hour: userData.budgetPerHour,
          payment_method: userData.paymentMethod,
          communication_preferences: userData.communicationPreferences,
          profile_completion_percentage: userData.profileCompletionPercentage,
          industry: userData.industry,
          project_types: userData.projectTypes,
          company: userData.company,
          position: userData.position
        })
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
  userData: Partial<Developer | Client>
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
