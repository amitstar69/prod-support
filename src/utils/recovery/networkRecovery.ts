import { toast } from 'sonner';

/**
 * Checks the network connectivity status
 * @returns Boolean indicating if the device is online
 */
export const checkNetworkStatus = (): boolean => {
  return navigator.onLine;
};

/**
 * Attempts to recover from network issues
 */
export const attemptNetworkRecovery = async (): Promise<boolean> => {
  if (!navigator.onLine) {
    toast.error('You are offline. Please check your internet connection.');
    return false;
  }
  
  try {
    // Try to fetch a small resource to verify actual connectivity
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch('/favicon.ico', { 
      method: 'HEAD',
      signal: controller.signal,
      cache: 'no-store'
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      console.log('Network connection verified');
      return true;
    } else {
      console.warn('Network check failed with status:', response.status);
      return false;
    }
  } catch (error) {
    console.error('Network recovery check failed:', error);
    return false;
  }
};

/**
 * Attempts to clear any cached data that might be causing issues
 */
export const clearAppCache = async (): Promise<void> => {
  try {
    // Clear localStorage entries that might be stale
    const keysToPreserve = ['theme', 'cookieConsent'];
    
    const authStateJson = localStorage.getItem('authState');
    let userId: string | null = null;
    
    if (authStateJson) {
      try {
        const authState = JSON.parse(authStateJson);
        userId = authState.userId || null;
      } catch (e) {
        console.error('Failed to parse auth state during cache clearing');
      }
    }
    
    // Get all localStorage keys
    const keysToRemove = Object.keys(localStorage).filter(key => {
      // Keep essential items
      if (keysToPreserve.includes(key)) return false;
      
      // Keep auth state but force refresh flags
      if (key === 'authState') return false;
      
      // Force refresh user data on next load if we have a userId
      if (userId && key === `userData_${userId}`) return true;
      if (userId && key === `userDataTime_${userId}`) return true;
      
      // Remove application and ticket caches
      return key.includes('ticket_') || key.includes('application_');
    });
    
    // Remove filtered keys
    keysToRemove.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.error(`Failed to remove key ${key}:`, e);
      }
    });
    
    console.log(`Cleared ${keysToRemove.length} cached items`);
    
    // If we have a userId, set the force refresh flag
    if (userId) {
      localStorage.setItem(`forceRefresh_${userId}`, 'true');
    }
    
    toast.info('Cleared application cache to fix loading issues');
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
};

/**
 * Complete recovery process that tries to fix network issues,
 * clears caches, and refreshes the page if needed
 */
export const performFullRecovery = async (): Promise<void> => {
  toast.info('Attempting to recover from loading issues...');
  
  // First check network
  const networkOk = await attemptNetworkRecovery();
  
  if (!networkOk) {
    toast.error('Network connection issues detected. Please check your internet connection.');
    return;
  }
  
  // Then clear cache
  await clearAppCache();
  
  // Wait a moment before refreshing
  setTimeout(() => {
    toast.info('Reloading page to apply fixes...');
    window.location.reload();
  }, 1000);
};
