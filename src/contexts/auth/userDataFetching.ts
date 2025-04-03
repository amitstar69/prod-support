
import { supabase } from '../../integrations/supabase/client';

// User data cache to reduce database queries
const userDataCache = new Map<string, { data: any, timestamp: number }>();
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

// Function to get current user data - placeholder implementation
export const getCurrentUserData = async (userId: string): Promise<any> => {
  // Check if cached data exists and is still valid
  const cachedData = userDataCache.get(userId);
  const now = Date.now();
  
  if (cachedData && (now - cachedData.timestamp) < CACHE_EXPIRY) {
    console.log('Using cached user data');
    return cachedData.data;
  }
  
  // If no valid cache, fetch from database
  try {
    if (!supabase) {
      console.error('Supabase client not initialized');
      return null;
    }
    
    const { data, error } = await supabase.from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
    
    // Cache the result
    userDataCache.set(userId, {
      data,
      timestamp: now
    });
    
    return data;
  } catch (error) {
    console.error('Exception getting user data:', error);
    return null;
  }
};

// Function to update user data - placeholder implementation
export const updateUserData = async (userId: string, userData: any): Promise<boolean> => {
  try {
    if (!supabase) {
      console.error('Supabase client not initialized');
      return false;
    }
    
    const { data, error } = await supabase.from('profiles')
      .update(userData)
      .eq('id', userId);
      
    if (error) {
      console.error('Error updating user data:', error);
      return false;
    }
    
    // Invalidate cache
    invalidateUserDataCache(userId);
    
    return true;
  } catch (error) {
    console.error('Exception updating user data:', error);
    return false;
  }
};

// Function to invalidate user data cache
export const invalidateUserDataCache = (userId: string): void => {
  console.log('Invalidating user data cache for:', userId);
  userDataCache.delete(userId);
};
