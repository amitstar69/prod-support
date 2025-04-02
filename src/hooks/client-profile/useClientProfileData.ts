
import { useState, useCallback, useEffect } from 'react';
import { useAuth, getCurrentUserData, invalidateUserDataCache } from '../../contexts/auth';
import { Client } from '../../types/product';
import { toast } from 'sonner';

export const useClientProfileData = () => {
  const { userId } = useAuth();
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingTimeoutReached, setLoadingTimeoutReached] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [maxRetryCount] = useState(3); // Maximum number of retries

  const fetchUserData = useCallback(async (forceRefresh = true) => {
    if (!userId) return;
    
    setIsLoading(true);
    setLoadingTimeoutReached(false);
    console.log('Fetching client profile data for user:', userId, 'forceRefresh:', forceRefresh, 'retry:', retryCount);
    
    // Set a loading timeout - make it shorter on retries
    const timeoutDuration = retryCount > 0 ? 15000 : 30000; // Increased timeouts (15s for retries, 30s initially)
    const timeoutId = setTimeout(() => {
      console.log('Profile loading timeout reached after', timeoutDuration/1000, 'seconds');
      setLoadingTimeoutReached(true);
      setIsLoading(false);
      
      // Only show toast on first timeout
      if (retryCount === 0) {
        toast.error("Loading profile data is taking longer than expected. You can try refreshing or logging out and back in.");
      }
    }, timeoutDuration);
    
    try {
      if (forceRefresh) {
        console.log('Forcing cache invalidation before fetch');
        invalidateUserDataCache(userId);
        // Add a small delay after cache invalidation to ensure it's processed
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      console.log('Fetching fresh user data');
      const userData = await getCurrentUserData();
      
      clearTimeout(timeoutId);
      
      if (userData) {
        // Check if this is a client data using properties specific to the Client type
        if (!('budgetPerHour' in userData) && !('projectTypes' in userData)) {
          console.error('User data is not client data:', userData);
          toast.error("Retrieved user data is not client data. This may indicate an issue with your account type.");
          setIsLoading(false);
          return;
        }
        
        const clientData = userData as Client;
        console.log('Client data fetched successfully:', clientData);
        setClient(clientData);
        
        // Reset retry count on successful fetch
        setRetryCount(0);
        setIsLoading(false);
      } else {
        console.error("User data not found");
        
        // Increment retry count for next attempt
        const nextRetryCount = retryCount + 1;
        setRetryCount(nextRetryCount);
        
        if (nextRetryCount <= maxRetryCount) {
          console.log(`Auto-retrying fetch (${nextRetryCount}/${maxRetryCount}) after delay...`);
          
          // Exponential backoff for retries (2s, 4s, 8s)
          const retryDelay = Math.min(2000 * Math.pow(2, retryCount), 8000);
          
          setTimeout(() => {
            toast.info(`Retry ${nextRetryCount}/${maxRetryCount}: Attempting to load profile data again...`);
            fetchUserData(true);
          }, retryDelay);
        } else {
          toast.error("Failed to load profile after multiple attempts. Please try refreshing the page.");
          setLoadingTimeoutReached(true);
          setIsLoading(false);
        }
      }
    } catch (error) {
      clearTimeout(timeoutId);
      
      console.error("Error fetching user data:", error);
      
      // Increment retry count
      const nextRetryCount = retryCount + 1;
      setRetryCount(nextRetryCount);
      
      if (nextRetryCount <= maxRetryCount) {
        console.log(`Error retry (${nextRetryCount}/${maxRetryCount}) after delay...`);
        
        // Exponential backoff for retries
        const retryDelay = Math.min(2000 * Math.pow(2, retryCount), 8000);
        
        toast.error(`Error loading profile. Retrying (${nextRetryCount}/${maxRetryCount})...`);
        setTimeout(() => {
          fetchUserData(true);
        }, retryDelay);
      } else {
        toast.error("Failed to load profile after multiple attempts. Please try refreshing the page.");
        setLoadingTimeoutReached(true);
        setIsLoading(false);
      }
    }
  }, [userId, retryCount, maxRetryCount]);
  
  useEffect(() => {
    if (userId) {
      console.log('Initial client profile data fetch for user:', userId);
      // Reset retry count when component mounts
      setRetryCount(0);
      fetchUserData(true);
    } else {
      setIsLoading(false);
    }
    
    // Clean up function to clear any pending timeouts when component unmounts
    return () => {
      console.log('useClientProfileData hook cleaning up');
    };
  }, [userId, fetchUserData]);

  const refreshProfile = useCallback(() => {
    if (userId) {
      console.log('Manual profile refresh requested for user:', userId);
      // Reset retry count when manually refreshing
      setRetryCount(0);
      fetchUserData(true);
    }
  }, [userId, fetchUserData]);

  return { 
    client, 
    isLoading, 
    loadingTimeoutReached, 
    refreshProfile 
  };
};
