
import { supabase } from '../../integrations/supabase/client';
import { toast } from 'sonner';
import { Developer, Client } from '../../types/product';
import { invalidateUserDataCache } from './userDataFetching';

/**
 * Updates user data in the database
 * 
 * @param updatedData Partial user data to update
 * @returns Promise that resolves to true if update was successful, false otherwise
 */
export const updateUserData = async (updatedData: Partial<Developer | Client>): Promise<boolean> => {
  const authStateStr = localStorage.getItem('authState');
  if (!authStateStr) {
    console.error('No auth state found in localStorage');
    toast.error('Authentication error. Please log in again.');
    return false;
  }
  
  const { isAuthenticated, userType, userId } = JSON.parse(authStateStr);
  
  if (!isAuthenticated || !userId) {
    console.error('User not authenticated or missing userId');
    toast.error('Authentication error. Please log in again.');
    return false;
  }
  
  console.log(`Updating ${userType} data for user ${userId}:`, updatedData);
  
  try {
    // Update base profile data first if it exists
    const baseProfileData: Record<string, any> = {};
    const userSpecificData: Record<string, any> = {};
    
    // Common fields that go into the base profile
    const baseProfileFields = ['name', 'email', 'phone', 'avatar', 'location', 
      'preferred_working_hours', 'profile_completed', 'profile_completion_percentage'];
    
    // Convert to snake_case for database
    for (const [key, value] of Object.entries(updatedData)) {
      // Skip null/undefined values
      if (value === undefined || value === null) continue;
      
      // Convert camelCase to snake_case
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      
      // Split fields between base profile and user-specific profile
      if (baseProfileFields.includes(snakeKey) || key === 'profileCompleted' || key === 'profileCompletionPercentage') {
        // Special handling for profile completion fields
        if (key === 'profileCompleted') {
          baseProfileData.profile_completed = value;
        } 
        else if (key === 'profileCompletionPercentage') {
          baseProfileData.profile_completion_percentage = value;
        } 
        else {
          baseProfileData[snakeKey] = value;
        }
      } else {
        // Handle special cases for developer/client fields
        if (key === 'hourlyRate') {
          userSpecificData.hourly_rate = value;
        } 
        else if (key === 'minuteRate') {
          userSpecificData.minute_rate = value;
        } 
        else if (key === 'communicationPreferences') {
          userSpecificData.communication_preferences = value;
        } 
        else if (key === 'portfolioItems') {
          userSpecificData.portfolio_items = value;
        } 
        else if (key === 'languagesSpoken') {
          userSpecificData.languages_spoken = value;
        } 
        else if (key === 'projectTypes') {
          userSpecificData.project_types = value;
        } 
        else if (key === 'techStack') {
          userSpecificData.tech_stack = value;
        } 
        else if (key === 'budgetPerHour') {
          userSpecificData.budget_per_hour = value;
        } 
        else if (key === 'preferredHelpFormat') {
          userSpecificData.preferred_help_format = value;
        } 
        else {
          // Default case - just convert to snake_case
          userSpecificData[snakeKey] = value;
        }
      }
    }
    
    console.log('Base profile data to update:', baseProfileData);
    
    // Update base profile if there are fields to update
    if (Object.keys(baseProfileData).length > 0) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update(baseProfileData)
        .eq('id', userId);
        
      if (profileError) {
        console.error('Error updating profile:', profileError);
        toast.error(`Failed to update profile: ${profileError.message}`);
        return false;
      }
    }
    
    console.log(`${userType}-specific data to update:`, userSpecificData);
    
    // Update user-specific profile if there are fields to update
    if (Object.keys(userSpecificData).length > 0) {
      let error;
      
      if (userType === 'developer') {
        const result = await supabase
          .from('developer_profiles')
          .update(userSpecificData)
          .eq('id', userId);
          
        error = result.error;
      } else if (userType === 'client') {
        const result = await supabase
          .from('client_profiles')
          .update(userSpecificData)
          .eq('id', userId);
          
        error = result.error;
      }
      
      if (error) {
        console.error(`Error updating ${userType} profile:`, error);
        toast.error(`Failed to update ${userType} profile: ${error.message}`);
        return false;
      }
    }
    
    // Invalidate cache to ensure fresh data on next fetch
    invalidateUserDataCache(userId);
    
    console.log('Profile update successful');
    return true;
  } catch (error) {
    console.error('Exception updating user data:', error);
    toast.error('An unexpected error occurred. Please try again later.');
    return false;
  }
};
