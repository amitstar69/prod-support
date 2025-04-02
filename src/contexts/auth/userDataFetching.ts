
import { supabase } from '../../integrations/supabase/client';
import { Developer, Client } from '../../types/product';
import { fetchUserData } from './userDataFetchers';
import { toast } from 'sonner';

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
  
  console.log('getCurrentUserData called for user:', userId, 'type:', userType);
  
  // Check for forced refresh flag
  const forceRefresh = localStorage.getItem(`forceRefresh_${userId}`) === 'true';
  if (forceRefresh) {
    console.log('Force refresh requested, skipping cache entirely');
    localStorage.removeItem(`forceRefresh_${userId}`);
    localStorage.removeItem(`userData_${userId}`);
    localStorage.removeItem(`userDataTime_${userId}`);
  } else {
    // Check local cache - using a 5-second cache time (increased from previous 2 seconds)
    const cachedDataStr = localStorage.getItem(`userData_${userId}`);
    const cacheTime = localStorage.getItem(`userDataTime_${userId}`);
    
    if (cachedDataStr && cacheTime) {
      const cacheAge = Date.now() - parseInt(cacheTime);
      // Use 5-second cache time for very fresh data
      if (cacheAge < 5 * 1000) { 
        console.log('Using cached user data', cacheAge/1000, 'seconds old');
        return JSON.parse(cachedDataStr);
      } else {
        console.log('Cache expired after', cacheAge/1000, 'seconds, fetching fresh data');
      }
    }
  }
  
  // Create a timeout promise
  const timeoutPromise = new Promise<null>((resolve) => {
    setTimeout(() => {
      console.warn('getCurrentUserData timeout reached');
      resolve(null);
    }, 15000); // 15 seconds timeout (increased from 8 seconds)
  });
  
  if (supabase) {
    try {
      console.time('fetchUserData');
      console.log('Fetching fresh user data from Supabase');
      // Race between the data fetch and timeout
      const dataPromise = fetchUserData(userType, userId);
      const result = await Promise.race([dataPromise, timeoutPromise]);
      console.timeEnd('fetchUserData');
      
      if (result === null) {
        console.error('Fetching user data timed out, falling back to localStorage');
        const localData = getUserDataFromLocalStorage(userType, userId);
        if (localData) {
          console.log('Found user data in localStorage, using as fallback');
          return localData;
        } else {
          console.error('No user data found in localStorage either');
          toast.error('Failed to load profile data: Connection timeout');
        }
        return null;
      }
      
      console.log('Fresh user data fetched successfully:', result);
      
      // Cache result for future use - making sure to avoid circular references
      try {
        // Clone the object to remove any circular references before storing
        const safeResult = JSON.parse(JSON.stringify(result));
        localStorage.setItem(`userData_${userId}`, JSON.stringify(safeResult));
        localStorage.setItem(`userDataTime_${userId}`, Date.now().toString());
      } catch (cacheError) {
        console.error('Error caching user data:', cacheError);
        // If we can't cache, just continue - it's not critical
      }
      
      return result;
    } catch (error) {
      console.error('Exception fetching user data from Supabase:', error);
      toast.error('Error fetching your profile: Network or server issue');
      // Fall back to localStorage
      return getUserDataFromLocalStorage(userType, userId);
    }
  } else {
    console.error('Supabase client not available');
    toast.error('Supabase client not available');
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

// Function to force refresh user data on next fetch
export const invalidateUserDataCache = (userId: string): void => {
  if (userId) {
    console.log(`Invalidating cache for user ${userId}`);
    // Set flag to force refresh on next fetch attempt
    localStorage.setItem(`forceRefresh_${userId}`, 'true');
    // Immediately remove cached data
    localStorage.removeItem(`userData_${userId}`);
    localStorage.removeItem(`userDataTime_${userId}`);
    console.log(`Cache invalidated for user ${userId}`);
  }
};
