
import { toast } from 'sonner';
import { attemptRecovery } from './emergencyLogout';

/**
 * Sets up detection for stuck app states
 * @returns Cleanup function to remove interval
 */
export const initStuckStateDetection = (): (() => void) => {
  console.log('Stuck state detection initialized');
  
  // Set up a periodic check for stuck loading states
  const intervalId = setInterval(() => {
    if (isAppStuck()) {
      console.warn('App appears to be in a stuck state for too long');
      toast.error('Application seems unresponsive. Attempting recovery...');
      attemptRecovery();
    }
  }, 30000); // Check every 30 seconds

  // Add visibility change detection
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      console.log('Tab became visible, checking app health');
      checkAppHealth();
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  // Check app health on initial load
  setTimeout(checkAppHealth, 5000);
  
  // Return cleanup function
  return () => {
    clearInterval(intervalId);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
};

/**
 * Check if the app seems to be stuck in a loading state
 */
export const isAppStuck = (): boolean => {
  const loadingStartTime = sessionStorage.getItem('loadingStartTime');
  if (!loadingStartTime) return false;
  
  const loadingDuration = Date.now() - Number(loadingStartTime);
  return loadingDuration > 15000; // Consider stuck if loading for more than 15 seconds
};

/**
 * Check overall app health
 */
export const checkAppHealth = (): void => {
  // Check if the main UI has rendered
  const mainContent = document.querySelector('main');
  if (!mainContent) {
    console.warn('Main content not found in DOM - possible rendering issue');
    
    // Check if we're just in a loading state or actually broken
    const isLoading = document.querySelector('.loading-indicator');
    if (isLoading && sessionStorage.getItem('loadingStartTime')) {
      const loadingTime = Date.now() - Number(sessionStorage.getItem('loadingStartTime'));
      if (loadingTime > 10000) {
        console.warn('Loading state persisted for too long, attempting recovery');
        attemptRecovery();
      }
    } else if (!isLoading) {
      console.warn('App appears broken (no content, no loading state)');
      attemptRecovery();
    }
  }
};

/**
 * Add a global timeout that will clear loading states if they persist too long
 */
export const setGlobalLoadingTimeout = (resetFn: () => void, timeoutMs = 15000): (() => void) => {
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
