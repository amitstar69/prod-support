
import { supabase } from '../../integrations/supabase/client';
import { Developer, Client } from '../../types/product';

// Cache for user data to avoid repeated fetches
const userDataCache: Record<string, { data: any; timestamp: number }> = {};
const CACHE_TTL = 60 * 1000; // 1 minute cache expiration

/**
 * Invalidates the cache for a specific user
 */
export const invalidateUserDataCache = (userId: string): void => {
  console.log('Invalidating user data cache for:', userId);
  delete userDataCache[userId];
};

/**
 * Gets the current user data, either from cache or fresh from DB
 */
export const getCurrentUserData = async (forceRefresh = false): Promise<Developer | Client | null> => {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('Error getting user:', userError);
      return null;
    }

    const userId = user.id;
    
    // Check cache unless forced refresh
    if (!forceRefresh && 
        userDataCache[userId] && 
        (Date.now() - userDataCache[userId].timestamp) < CACHE_TTL) {
      console.log('Returning cached user data for:', userId);
      return userDataCache[userId].data;
    }

    // Get user type
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', userId)
      .single();
    
    if (profileError) {
      console.error('Error fetching user type:', profileError);
      return null;
    }

    // Based on user type, fetch relevant profile data
    let userData = null;
    
    if (profileData.user_type === 'developer') {
      const { data, error } = await supabase
        .from('developer_profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error('Error fetching developer profile:', error);
      } else {
        userData = {
          ...data,
          userType: 'developer'
        };
      }
    } else if (profileData.user_type === 'client') {
      const { data, error } = await supabase
        .from('client_profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error('Error fetching client profile:', error);
      } else {
        userData = {
          ...data,
          userType: 'client'
        };
      }
    }

    if (userData) {
      // Update cache
      userDataCache[userId] = {
        data: userData,
        timestamp: Date.now()
      };
    }
    
    return userData;
  } catch (error) {
    console.error('Error in getCurrentUserData:', error);
    return null;
  }
};

/**
 * Updates user data in the database
 */
export const updateUserData = async (
  data: Partial<Developer | Client>
): Promise<boolean> => {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('Error getting user for update:', userError);
      return false;
    }

    const userId = user.id;

    // Get user type
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', userId)
      .single();
    
    if (profileError) {
      console.error('Error fetching user type for update:', profileError);
      return false;
    }

    // Create a properly typed update object
    const updateData: Record<string, any> = { ...data };

    // Handle availability specifically for developer profiles
    if ('availability' in updateData && profileData.user_type === 'developer') {
      if (typeof updateData.availability === 'object') {
        // Convert complex availability object to boolean for developer profiles
        // as the database schema expects a boolean
        updateData.availability = true;
      }
      // If it's already a boolean, no conversion needed
    }

    // Update appropriate profile table based on user type
    if (profileData.user_type === 'developer') {
      const { error } = await supabase
        .from('developer_profiles')
        .update(updateData)
        .eq('id', userId);
        
      if (error) {
        console.error('Error updating developer profile:', error);
        return false;
      }
    } else if (profileData.user_type === 'client') {
      const { error } = await supabase
        .from('client_profiles')
        .update(updateData)
        .eq('id', userId);
        
      if (error) {
        console.error('Error updating client profile:', error);
        return false;
      }
    }
    
    // Invalidate cache after update
    invalidateUserDataCache(userId);
    
    return true;
  } catch (error) {
    console.error('Error in updateUserData:', error);
    return false;
  }
};
