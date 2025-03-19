
import { supabase } from '../../integrations/supabase';
import { Developer, Client } from '../../types/product';
import { toast } from 'sonner';

type UserData = Partial<Developer | Client>;

// Helper function to check if a property exists in an object
function hasProperty<K extends string>(obj: object, prop: K): obj is { [key in K]: unknown } {
  return prop in obj;
}

// Function to update user data
export const updateUserData = async (userData: UserData): Promise<boolean> => {
  try {
    console.log('Starting updateUserData with payload:', userData);
    
    const { error } = await supabase.auth.getSession();
    if (error) {
      console.error('Session error:', error.message);
      return false;
    }

    const { data: user, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('User fetch error:', userError?.message);
      return false;
    }

    // Determine user type from auth metadata
    const userType = user.user?.user_metadata?.user_type as 'developer' | 'client' | undefined;
    
    console.log('Updating user data:', { userType, userId: user.user.id });
    console.log('Update payload:', userData);
    
    // First update the base profile in profiles table
    const baseProfileData: Record<string, any> = {};
    
    // Common fields for profiles table
    if (hasProperty(userData, 'name')) baseProfileData.name = userData.name;
    if (hasProperty(userData, 'email')) baseProfileData.email = userData.email;
    if (hasProperty(userData, 'location')) baseProfileData.location = userData.location;
    if (hasProperty(userData, 'username')) baseProfileData.username = userData.username;
    if (hasProperty(userData, 'description')) baseProfileData.description = userData.description;
    // Important: bio does not belong in the profiles table
    // if (hasProperty(userData, 'bio')) baseProfileData.bio = userData.bio; // REMOVED THIS LINE
    if (hasProperty(userData, 'image')) baseProfileData.image = userData.image;
    if (hasProperty(userData, 'profileCompleted')) baseProfileData.profile_completed = userData.profileCompleted;
    // Do not include profile_completion_percentage in base profiles as it doesn't exist there
    if (hasProperty(userData, 'onboardingCompletedAt')) baseProfileData.onboarding_completed_at = userData.onboardingCompletedAt;
    
    let baseProfileSuccess = true;
    let baseProfileResult = null;
    
    if (Object.keys(baseProfileData).length > 0) {
      console.log('Updating base profile data:', baseProfileData);
      try {
        const { error: baseProfileError, data: updatedProfileData } = await supabase
          .from('profiles')
          .update(baseProfileData)
          .eq('id', user.user.id)
          .select();
        
        if (baseProfileError) {
          console.error('Base profile update error:', baseProfileError.message, baseProfileError);
          toast.error(`Error updating profile: ${baseProfileError.message}`);
          baseProfileSuccess = false;
        } else {
          console.log('Base profile update successful:', updatedProfileData);
          baseProfileResult = updatedProfileData;
        }
      } catch (updateError) {
        console.error('Exception during base profile update:', updateError);
        baseProfileSuccess = false;
      }
    }
    
    // Prepare data for user-type specific table
    const specificProfileData: Record<string, any> = {};
    
    // User type specific fields
    if (userType === 'developer') {
      if (hasProperty(userData, 'phone')) specificProfileData.phone = userData.phone;
      if (hasProperty(userData, 'category')) specificProfileData.category = userData.category;
      if (hasProperty(userData, 'skills')) specificProfileData.skills = userData.skills;
      if (hasProperty(userData, 'hourlyRate')) specificProfileData.hourly_rate = userData.hourlyRate;
      if (hasProperty(userData, 'minuteRate')) specificProfileData.minute_rate = userData.minuteRate;
      if (hasProperty(userData, 'experience')) specificProfileData.experience = userData.experience;
      if (hasProperty(userData, 'availability')) {
        // For developer, availability can be a boolean or an object
        specificProfileData.availability = userData.availability;
      }
      if (hasProperty(userData, 'bio')) specificProfileData.bio = userData.bio; // Add bio to developer profile
      if (hasProperty(userData, 'communicationPreferences')) specificProfileData.communication_preferences = userData.communicationPreferences;
    } else if (userType === 'client') {
      // Make sure bio is in the client_profiles table update
      if (hasProperty(userData, 'bio')) specificProfileData.bio = userData.bio;
      if (hasProperty(userData, 'industry')) specificProfileData.industry = userData.industry;
      if (hasProperty(userData, 'company')) specificProfileData.company = userData.company;
      if (hasProperty(userData, 'position')) specificProfileData.position = userData.position;
      if (hasProperty(userData, 'budgetPerHour')) specificProfileData.budget_per_hour = userData.budgetPerHour;
      if (hasProperty(userData, 'lookingFor')) specificProfileData.looking_for = userData.lookingFor;
      if (hasProperty(userData, 'preferredHelpFormat')) specificProfileData.preferred_help_format = userData.preferredHelpFormat;
      if (hasProperty(userData, 'techStack')) specificProfileData.tech_stack = userData.techStack;
      if (hasProperty(userData, 'projectTypes')) specificProfileData.project_types = userData.projectTypes;
      if (hasProperty(userData, 'paymentMethod')) specificProfileData.payment_method = userData.paymentMethod;
      if (hasProperty(userData, 'communicationPreferences')) specificProfileData.communication_preferences = userData.communicationPreferences;
      if (hasProperty(userData, 'profileCompletionPercentage')) specificProfileData.profile_completion_percentage = userData.profileCompletionPercentage;
      if (hasProperty(userData, 'availability')) {
        // For client, ensure availability is an object if it's provided
        if (typeof userData.availability === 'boolean') {
          // Convert boolean to appropriate availability object
          specificProfileData.availability = userData.availability ? {} : null;
        } else {
          specificProfileData.availability = userData.availability;
        }
      }
    }
    
    let specificProfileSuccess = true;
    let specificProfileResult = null;
    
    // Only update the specific profile table if there are fields to update
    if (Object.keys(specificProfileData).length > 0) {
      // Update the type-specific profile table
      const tableName = userType === 'developer' ? 'developer_profiles' : 'client_profiles';
      console.log(`Updating ${tableName} data:`, specificProfileData);
      
      try {
        const { error: updateError, data: updatedTypeData } = await supabase
          .from(tableName)
          .update(specificProfileData)
          .eq('id', user.user.id)
          .select();
        
        if (updateError) {
          console.error(`${tableName} update error:`, updateError.message, updateError);
          toast.error(`Error updating ${userType} profile: ${updateError.message}`);
          specificProfileSuccess = false;
        } else {
          console.log(`${tableName} update successful:`, updatedTypeData);
          specificProfileResult = updatedTypeData;
        }
      } catch (updateError) {
        console.error(`Exception during ${userType} profile update:`, updateError);
        specificProfileSuccess = false;
      }
    }
    
    // Force a complete cache invalidation
    console.log('Clearing cache for user:', user.user.id);
    localStorage.removeItem(`userData_${user.user.id}`);
    localStorage.removeItem(`userDataTime_${user.user.id}`);
    localStorage.setItem(`forceRefresh_${user.user.id}`, 'true');
    
    // Consider either base profile or specific profile update success as overall success
    // This is a change from the previous logic which required both to succeed
    const success = baseProfileSuccess || specificProfileSuccess;
    console.log('Profile update complete. Base profile success:', baseProfileSuccess, 'Specific profile success:', specificProfileSuccess);
    
    if (!success) {
      console.error('Profile update failed. Will not update local storage.');
      return false;
    }
    
    // Also update any local storage mock data for development purposes
    updateUserDataInLocalStorage(user.user.id, userData);
    
    // Show success toast message
    toast.success('Profile updated successfully');
    
    return success;
  } catch (error) {
    console.error('Update user data error:', error);
    toast.error(`Unexpected error updating profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return false;
  }
};

// Function for local storage updates
export const updateUserDataInLocalStorage = (userId: string, userData: UserData): boolean => {
  try {
    // Get existing data from localStorage
    const developersStr = localStorage.getItem('mockDevelopers');
    const clientsStr = localStorage.getItem('mockClients');
    
    const developers = developersStr ? JSON.parse(developersStr) as Developer[] : [];
    const clients = clientsStr ? JSON.parse(clientsStr) as Client[] : [];
    
    console.log('Updating localStorage data for user:', userId);
    console.log('Current localStorage state:', { developers, clients });
    
    let updated = false;
    
    // Check if the user is a developer
    const developerIndex = developers.findIndex(dev => dev.id === userId);
    if (developerIndex !== -1) {
      // Update developer data
      developers[developerIndex] = { 
        ...developers[developerIndex], 
        ...userData,
      };
      localStorage.setItem('mockDevelopers', JSON.stringify(developers));
      console.log('Updated developer data in localStorage:', developers[developerIndex]);
      updated = true;
    }
    
    // Check if the user is a client
    const clientIndex = clients.findIndex(client => client.id === userId);
    if (clientIndex !== -1) {
      // Update client data
      clients[clientIndex] = { 
        ...clients[clientIndex], 
        ...userData,
        // Handle availability appropriately
        ...(hasProperty(userData, 'availability') && {
          availability: typeof userData.availability === 'boolean' 
            ? (userData.availability ? {} : null) 
            : userData.availability
        })
      };
      localStorage.setItem('mockClients', JSON.stringify(clients));
      console.log('Updated client data in localStorage:', clients[clientIndex]);
      updated = true;
    }
    
    if (!updated) {
      console.log('User not found in localStorage mock data:', userId);
    }
    
    return updated;
  } catch (error) {
    console.error('Error updating user data in localStorage:', error);
    return false;
  }
};
