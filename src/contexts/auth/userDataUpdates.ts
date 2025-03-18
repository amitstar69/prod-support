
import { supabase } from '../../integrations/supabase/client';
import { Developer, Client } from '../../types/product';
import { getUserDataFromLocalStorage } from './userDataFetching';

// Function to update user data
export const updateUserData = async (userData: Partial<Developer | Client>): Promise<boolean> => {
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
  
  if (supabase) {
    try {
      // Update basic profile data and type-specific data
      const success = await Promise.all([
        updateProfileData(userId, userData),
        updateTypeSpecificData(userType, userId, userData)
      ]);
      
      // Also update in localStorage for offline access
      updateUserDataInLocalStorage(userType, userId, userData);
      
      return success.every(Boolean);
    } catch (error) {
      console.error('Exception updating user data in Supabase:', error);
      // Fallback to localStorage
      return updateUserDataInLocalStorage(userType, userId, userData);
    }
  } else {
    // Fallback to localStorage
    return updateUserDataInLocalStorage(userType, userId, userData);
  }
};

// Helper to update profile data
const updateProfileData = async (userId: string, userData: Partial<Developer | Client>): Promise<boolean> => {
  // Separate profile data from type-specific data
  const {
    // Properties that can only exist on Developer or Client (exclude from profile update)
    hourlyRate, minuteRate, category, skills, experience, rating, availability,
    featured, online, lastActive, communicationPreferences,
    lookingFor, completedProjects, profileCompletionPercentage, preferredHelpFormat,
    budget, paymentMethod, bio, techStack, budgetPerHour, company, position,
    projectTypes, industry, socialLinks, timeZone,
    // Common properties or ones we want to handle separately
    ...profileData
  } = userData as any;

  // If nothing to update, return success
  if (Object.keys(profileData).length === 0) {
    return true;
  }

  // Convert camelCase to snake_case for database fields
  const dbProfileData = {
    ...profileData,
    preferred_working_hours: profileData.preferredWorkingHours,
    profile_completed: profileData.profileCompleted,
  };
  
  delete dbProfileData.preferredWorkingHours;
  delete dbProfileData.profileCompleted;
  
  const { error: profileError } = await supabase
    .from('profiles')
    .update(dbProfileData)
    .eq('id', userId);
    
  if (profileError) {
    console.error('Error updating profile in Supabase:', profileError);
    return false;
  }
  
  return true;
};

// Helper to update type-specific data
const updateTypeSpecificData = async (
  userType: string | null,
  userId: string | null,
  userData: Partial<Developer | Client>
): Promise<boolean> => {
  if (userType === 'developer') {
    return await updateDeveloperData(userId, userData as Partial<Developer>);
  } else if (userType === 'client') {
    return await updateClientData(userId, userData as Partial<Client>);
  }
  return false;
};

// Helper to update developer-specific data
const updateDeveloperData = async (userId: string | null, userData: Partial<Developer>): Promise<boolean> => {
  const devUpdates: any = {};
  
  if (userData.hourlyRate !== undefined) devUpdates.hourly_rate = userData.hourlyRate;
  if (userData.minuteRate !== undefined) devUpdates.minute_rate = userData.minuteRate;
  if (userData.category !== undefined) devUpdates.category = userData.category;
  if (userData.skills !== undefined) devUpdates.skills = userData.skills;
  if (userData.experience !== undefined) devUpdates.experience = userData.experience;
  if (userData.rating !== undefined) devUpdates.rating = userData.rating;
  if (userData.availability !== undefined) devUpdates.availability = userData.availability;
  if (userData.featured !== undefined) devUpdates.featured = userData.featured;
  if (userData.online !== undefined) devUpdates.online = userData.online;
  if (userData.lastActive !== undefined) devUpdates.last_active = userData.lastActive;
  if (userData.communicationPreferences !== undefined) 
    devUpdates.communication_preferences = userData.communicationPreferences;
  
  if (Object.keys(devUpdates).length === 0) {
    return true;
  }
  
  const { error: devError } = await supabase
    .from('developer_profiles')
    .update(devUpdates)
    .eq('id', userId);
    
  if (devError) {
    console.error('Error updating developer profile:', devError);
    return false;
  }
  
  return true;
};

// Helper to update client-specific data
const updateClientData = async (userId: string | null, userData: Partial<Client>): Promise<boolean> => {
  const clientUpdates: any = {};
  
  if (userData.lookingFor !== undefined) clientUpdates.looking_for = userData.lookingFor;
  if (userData.completedProjects !== undefined) clientUpdates.completed_projects = userData.completedProjects;
  if (userData.profileCompletionPercentage !== undefined) 
    clientUpdates.profile_completion_percentage = userData.profileCompletionPercentage;
  if (userData.preferredHelpFormat !== undefined) 
    clientUpdates.preferred_help_format = userData.preferredHelpFormat;
  if (userData.budget !== undefined) clientUpdates.budget = userData.budget;
  if (userData.paymentMethod !== undefined) clientUpdates.payment_method = userData.paymentMethod;
  if (userData.bio !== undefined) clientUpdates.bio = userData.bio;
  if (userData.techStack !== undefined) clientUpdates.tech_stack = userData.techStack;
  if (userData.budgetPerHour !== undefined) clientUpdates.budget_per_hour = userData.budgetPerHour;
  if (userData.company !== undefined) clientUpdates.company = userData.company;
  if (userData.position !== undefined) clientUpdates.position = userData.position;
  if (userData.projectTypes !== undefined) clientUpdates.project_types = userData.projectTypes;
  if (userData.industry !== undefined) clientUpdates.industry = userData.industry;
  if (userData.socialLinks !== undefined) clientUpdates.social_links = userData.socialLinks;
  if (userData.timeZone !== undefined) clientUpdates.time_zone = userData.timeZone;
  if (userData.availability !== undefined) clientUpdates.availability = userData.availability;
  if (userData.communicationPreferences !== undefined) 
    clientUpdates.communication_preferences = userData.communicationPreferences;
  
  if (Object.keys(clientUpdates).length === 0) {
    return true;
  }
  
  const { error: clientError } = await supabase
    .from('client_profiles')
    .update(clientUpdates)
    .eq('id', userId);
    
  if (clientError) {
    console.error('Error updating client profile:', clientError);
    return false;
  }
  
  return true;
};

// Helper to update user data in localStorage
export const updateUserDataInLocalStorage = (
  userType: string | null, 
  userId: string | null, 
  userData: Partial<Developer | Client>
): boolean => {
  if (userType === 'developer') {
    const developers = JSON.parse(localStorage.getItem('mockDevelopers') || '[]');
    const index = developers.findIndex((dev: Developer) => dev.id === userId);
    
    if (index !== -1) {
      developers[index] = { ...developers[index], ...userData };
      localStorage.setItem('mockDevelopers', JSON.stringify(developers));
      return true;
    }
  } else if (userType === 'client') {
    const clients = JSON.parse(localStorage.getItem('mockClients') || '[]');
    const index = clients.findIndex((client: Client) => client.id === userId);
    
    if (index !== -1) {
      clients[index] = { ...clients[index], ...userData };
      localStorage.setItem('mockClients', JSON.stringify(clients));
      return true;
    }
  }
  
  return false;
};
