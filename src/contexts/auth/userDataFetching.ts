
import { supabase } from '../../integrations/supabase/client';
import { Developer, Client } from '../../types/product';
import { fetchUserData } from './userDataFetchers';

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

// Helper to get user data from localStorage
export const getUserDataFromLocalStorage = (userType: string | null, userId: string | null): Developer | Client | null => {
  if (userType === 'developer') {
    const developers = JSON.parse(localStorage.getItem('mockDevelopers') || '[]');
    return developers.find((dev: Developer) => dev.id === userId) || null;
  } else if (userType === 'client') {
    const clients = JSON.parse(localStorage.getItem('mockClients') || '[]');
    return clients.find((client: Client) => client.id === userId) || null;
  }
  return null;
};
