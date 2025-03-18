
import { supabase } from '../../integrations/supabase';
import { Developer, Client } from '../../types/product';

type UserData = Partial<Developer | Client>;

// Helper function to check if a property exists in an object
function hasProperty<K extends string>(obj: object, prop: K): obj is { [key in K]: unknown } {
  return prop in obj;
}

// Function to update user data
export const updateUserData = async (userData: UserData): Promise<boolean> => {
  try {
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
    
    // Prepare data for database
    const dataToUpdate: Record<string, any> = {};
    
    // Common fields for both user types
    if (hasProperty(userData, 'name')) dataToUpdate.name = userData.name;
    if (hasProperty(userData, 'email')) dataToUpdate.email = userData.email;
    if (hasProperty(userData, 'location')) dataToUpdate.location = userData.location;
    if (hasProperty(userData, 'username')) dataToUpdate.username = userData.username;
    if (hasProperty(userData, 'description')) dataToUpdate.description = userData.description;
    if (hasProperty(userData, 'bio')) dataToUpdate.bio = userData.bio;
    if (hasProperty(userData, 'image')) dataToUpdate.image = userData.image;
    if (hasProperty(userData, 'profileCompleted')) dataToUpdate.profile_completed = userData.profileCompleted;
    if (hasProperty(userData, 'profileCompletionPercentage')) dataToUpdate.profile_completion_percentage = userData.profileCompletionPercentage;
    if (hasProperty(userData, 'onboardingCompletedAt')) dataToUpdate.onboarding_completed_at = userData.onboardingCompletedAt;
    
    // User type specific fields
    if (userType === 'developer') {
      if (hasProperty(userData, 'phone')) dataToUpdate.phone = userData.phone;
      if (hasProperty(userData, 'category')) dataToUpdate.category = userData.category;
      if (hasProperty(userData, 'skills')) dataToUpdate.skills = userData.skills;
      if (hasProperty(userData, 'hourlyRate')) dataToUpdate.hourly_rate = userData.hourlyRate;
      if (hasProperty(userData, 'minuteRate')) dataToUpdate.minute_rate = userData.minuteRate;
      if (hasProperty(userData, 'experience')) dataToUpdate.experience = userData.experience;
      if (hasProperty(userData, 'availability')) dataToUpdate.availability = userData.availability;
    } else if (userType === 'client') {
      if (hasProperty(userData, 'industry')) dataToUpdate.industry = userData.industry;
      if (hasProperty(userData, 'company')) dataToUpdate.company = userData.company;
      if (hasProperty(userData, 'position')) dataToUpdate.position = userData.position;
      if (hasProperty(userData, 'budgetPerHour')) dataToUpdate.budget_per_hour = userData.budgetPerHour;
      if (hasProperty(userData, 'lookingFor')) dataToUpdate.looking_for = userData.lookingFor;
      if (hasProperty(userData, 'preferredHelpFormat')) dataToUpdate.preferred_help_format = userData.preferredHelpFormat;
      if (hasProperty(userData, 'techStack')) dataToUpdate.tech_stack = userData.techStack;
      if (hasProperty(userData, 'projectTypes')) dataToUpdate.project_types = userData.projectTypes;
      if (hasProperty(userData, 'paymentMethod')) dataToUpdate.payment_method = userData.paymentMethod;
    }
    
    // Update profiles table
    const tableName = userType === 'developer' ? 'developer_profiles' : 'client_profiles';
    const { error: updateError } = await supabase
      .from(tableName)
      .update(dataToUpdate)
      .eq('id', user.user.id);
    
    if (updateError) {
      console.error('Profile update error:', updateError.message);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Update user data error:', error);
    return false;
  }
};
