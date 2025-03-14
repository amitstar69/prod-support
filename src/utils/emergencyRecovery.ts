
import { toast } from 'sonner';

/**
 * Emergency recovery utility that provides a way to escape from frozen states
 * and recover from various error conditions.
 */

// Initialize a listener for keyboard shortcuts for emergency logout
export const initEmergencyRecovery = () => {
  // Listen for Escape key + L key pressed together (emergency logout)
  const handleKeyDown = (event: KeyboardEvent) => {
    // Check for Alt + L as the emergency logout combination
    if (event.altKey && event.key.toLowerCase() === 'l') {
      console.log('Emergency recovery triggered via keyboard shortcut');
      performEmergencyLogout();
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  
  // Set up a periodic check for stuck loading states
  const intervalId = setInterval(() => {
    if (isAppStuck()) {
      console.warn('App appears to be in a stuck state for too long');
      toast.error('Application seems unresponsive. Attempting recovery...');
      attemptRecovery();
    }
  }, 30000); // Check every 30 seconds
  
  // Return cleanup function
  return () => {
    window.removeEventListener('keydown', handleKeyDown);
    clearInterval(intervalId);
  };
};

// Check if the app seems to be stuck in a loading state
const isAppStuck = () => {
  const loadingStartTime = sessionStorage.getItem('loadingStartTime');
  if (!loadingStartTime) return false;
  
  const loadingDuration = Date.now() - Number(loadingStartTime);
  return loadingDuration > 15000; // Consider stuck if loading for more than 15 seconds
};

// Try to recover the app from a stuck state
const attemptRecovery = () => {
  console.log('Attempting app recovery');
  sessionStorage.removeItem('loadingStartTime');
  
  // Refresh the page as a last resort
  try {
    // Force a hard refresh to clear any cached state
    window.location.reload();
  } catch (error) {
    console.error('Error during recovery attempt:', error);
  }
};

// Add a global timeout that will clear loading states if they persist too long
export const setGlobalLoadingTimeout = (resetFn: () => void, timeoutMs = 15000) => {
  // Mark the start of a loading operation
  sessionStorage.setItem('loadingStartTime', Date.now().toString());
  
  const timeoutId = setTimeout(() => {
    console.warn('Global loading timeout reached, resetting application state');
    sessionStorage.removeItem('loadingStartTime');
    resetFn();
    toast.error('The operation is taking longer than expected. Application state has been reset.');
  }, timeoutMs);
  
  return () => {
    clearTimeout(timeoutId);
    sessionStorage.removeItem('loadingStartTime');
  };
};

// Function to completely reset the application state and return to the home page
export const performEmergencyLogout = () => {
  console.log('Performing emergency logout');
  
  try {
    // Clear all auth-related localStorage items
    localStorage.removeItem('authState');
    localStorage.removeItem('supabase.auth.token');
    
    // Clear any other app state that might be causing issues
    sessionStorage.clear();
    
    // Clear cache storage if possible
    if ('caches' in window) {
      caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
          caches.delete(cacheName);
        });
      });
    }
    
    // Show a notification
    toast.info('Emergency recovery performed. Reloading page...');
    
    // Force page reload after a slight delay to allow toast to be seen
    setTimeout(() => {
      window.location.href = '/';
      setTimeout(() => window.location.reload(), 100);
    }, 1000);
  } catch (error) {
    console.error('Error during emergency logout:', error);
    
    // Absolute fallback: direct navigation with hard refresh
    window.location.href = '/';
    setTimeout(() => window.location.reload(), 100);
  }
};
