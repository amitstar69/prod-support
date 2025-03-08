// Import only what's needed to keep the file focused
import { supabase } from '../../integrations/supabase/client';
import { Developer, Client } from '../../types/product';

// Function to get the current user's data with timeout
export const getCurrentUserData = async (): Promise<Developer | Client | null> => {
  // First check if we have auth state
  const authStateStr = localStorage.getItem('authState');
  if (!authStateStr) {
    console.error('No auth state found in localStorage');
    return null;
  }
  
  const { isAuthenticated, userType, userId } = JSON.parse(authStateStr);
  
  if (!isAuthenticated || !userId) {
    console.error('User not authenticated or missing userId');
    return null;
  }
  
  // Create a timeout promise
  const timeoutPromise = new Promise<null>((resolve) => {
    setTimeout(() => {
      console.warn('getCurrentUserData timeout reached');
      resolve(null);
    }, 5000); // 5 seconds timeout
  });
  
  if (supabase) {
    try {
      // Race between the data fetch and timeout
      const dataPromise = fetchUserData(userType, userId);
      const result = await Promise.race([dataPromise, timeoutPromise]);
      
      if (result === null) {
        console.error('Fetching user data timed out, falling back to localStorage');
        return getUserDataFromLocalStorage(userType, userId);
      }
      
      return result;
    } catch (error) {
      console.error('Exception fetching user data from Supabase:', error);
      // Fall back to localStorage
      return getUserDataFromLocalStorage(userType, userId);
    }
  } else {
    console.error('Supabase client not available');
    // Use localStorage as fallback
    return getUserDataFromLocalStorage(userType, userId);
  }
};

// Helper function to fetch user data
const fetchUserData = async (userType: string | null, userId: string | null): Promise<Developer | Client | null> => {
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
  } else {
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
  }
};

// Helper to get user data from localStorage
const getUserDataFromLocalStorage = (userType: string | null, userId: string | null): Developer | Client | null => {
  if (userType === 'developer') {
    const developers = JSON.parse(localStorage.getItem('mockDevelopers') || '[]');
    return developers.find((dev: Developer) => dev.id === userId) || null;
  } else if (userType === 'client') {
    const clients = JSON.parse(localStorage.getItem('mockClients') || '[]');
    return clients.find((client: Client) => client.id === userId) || null;
  }
  return null;
};

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
      // Separate profile data from type-specific data using type assertion and type guards
      const {
        // Properties that can only exist on Developer
        hourlyRate, minuteRate, category, skills, experience, rating, availability,
        featured, online, lastActive, communicationPreferences,
        // Properties that can only exist on Client
        lookingFor, completedProjects, profileCompletionPercentage, preferredHelpFormat,
        budget, paymentMethod, bio, techStack, budgetPerHour, company, position,
        projectTypes, industry, socialLinks, timeZone,
        // Common properties or ones we want to handle separately
        ...profileData
      } = userData as any; // Use type assertion to bypass TypeScript's type checking

      // Update the profiles table if there's data to update
      if (Object.keys(profileData).length > 0) {
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
          // Still try to update type-specific data if profile update fails
        }
      }
      
      // Update type-specific tables
      if (userType === 'developer') {
        const devUpdates: any = {};
        
        if (hourlyRate !== undefined) devUpdates.hourly_rate = hourlyRate;
        if (minuteRate !== undefined) devUpdates.minute_rate = minuteRate;
        if (category !== undefined) devUpdates.category = category;
        if (skills !== undefined) devUpdates.skills = skills;
        if (experience !== undefined) devUpdates.experience = experience;
        if (rating !== undefined) devUpdates.rating = rating;
        if (availability !== undefined) devUpdates.availability = availability;
        if (featured !== undefined) devUpdates.featured = featured;
        if (online !== undefined) devUpdates.online = online;
        if (lastActive !== undefined) devUpdates.last_active = lastActive;
        if (communicationPreferences !== undefined) devUpdates.communication_preferences = communicationPreferences;
        
        if (Object.keys(devUpdates).length > 0) {
          const { error: devError } = await supabase
            .from('developer_profiles')
            .update(devUpdates)
            .eq('id', userId);
            
          if (devError) {
            console.error('Error updating developer profile:', devError);
            return updateUserDataInLocalStorage(userType, userId, userData);
          }
        }
      } else if (userType === 'client') {
        const clientUpdates: any = {};
        
        if (lookingFor !== undefined) clientUpdates.looking_for = lookingFor;
        if (completedProjects !== undefined) clientUpdates.completed_projects = completedProjects;
        if (profileCompletionPercentage !== undefined) clientUpdates.profile_completion_percentage = profileCompletionPercentage;
        if (preferredHelpFormat !== undefined) clientUpdates.preferred_help_format = preferredHelpFormat;
        if (budget !== undefined) clientUpdates.budget = budget;
        if (paymentMethod !== undefined) clientUpdates.payment_method = paymentMethod;
        if (bio !== undefined) clientUpdates.bio = bio;
        if (techStack !== undefined) clientUpdates.tech_stack = techStack;
        if (budgetPerHour !== undefined) clientUpdates.budget_per_hour = budgetPerHour;
        if (company !== undefined) clientUpdates.company = company;
        if (position !== undefined) clientUpdates.position = position;
        if (projectTypes !== undefined) clientUpdates.project_types = projectTypes;
        if (industry !== undefined) clientUpdates.industry = industry;
        if (socialLinks !== undefined) clientUpdates.social_links = socialLinks;
        if (timeZone !== undefined) clientUpdates.time_zone = timeZone;
        if (availability !== undefined) clientUpdates.availability = availability;
        if (communicationPreferences !== undefined) clientUpdates.communication_preferences = communicationPreferences;
        
        if (Object.keys(clientUpdates).length > 0) {
          const { error: clientError } = await supabase
            .from('client_profiles')
            .update(clientUpdates)
            .eq('id', userId);
            
          if (clientError) {
            console.error('Error updating client profile:', clientError);
            // Fall back to localStorage update
            return updateUserDataInLocalStorage(userType, userId, userData);
          }
        }
      }
      
      // Also update in localStorage for offline access
      updateUserDataInLocalStorage(userType, userId, userData);
      
      return true;
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

// Helper to update user data in localStorage
const updateUserDataInLocalStorage = (
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
