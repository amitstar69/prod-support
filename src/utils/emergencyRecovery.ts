
import { toast } from 'sonner';

/**
 * Emergency recovery utility that provides a way to escape from frozen states
 * and recover from various error conditions.
 */

// Initialize a listener for keyboard shortcuts for emergency logout
export const initEmergencyRecovery = () => {
  console.log('Emergency recovery initialized');
  
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

  // Add visibility change detection
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      console.log('Tab became visible, checking app state');
      checkAppHealth();
    }
  });
  
  // Check app health on initial load
  setTimeout(checkAppHealth, 5000);
  
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

// Check overall app health
const checkAppHealth = () => {
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

// Try to recover the app from a stuck state
const attemptRecovery = () => {
  console.log('Attempting app recovery');
  sessionStorage.removeItem('loadingStartTime');
  
  // Try clearing auth state first
  try {
    localStorage.removeItem('authState');
  } catch (e) {
    console.error('Failed to clear auth state', e);
  }
  
  // If we still have a Supabase session, try to log out
  try {
    const supabase = (window as any).supabase;
    if (supabase && supabase.auth) {
      supabase.auth.signOut().catch((e: any) => {
        console.error('Failed to sign out of Supabase', e);
      });
    }
  } catch (e) {
    console.error('Error accessing Supabase client', e);
  }
  
  toast.info('Attempting to recover application state...');
  
  // Refresh the page as a last resort
  try {
    // Force a hard refresh to clear any cached state
    setTimeout(() => {
      window.location.reload();
    }, 1000);
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

// Detect if browser support is adequate
const checkBrowserSupport = () => {
  let issues = [];
  
  if (!window.localStorage) 
    issues.push("localStorage not supported");
  
  if (!window.sessionStorage)
    issues.push("sessionStorage not supported");
  
  if (!window.fetch)
    issues.push("fetch API not supported");
    
  return {
    supported: issues.length === 0,
    issues
  };
};

// Initialize browser check
setTimeout(() => {
  const support = checkBrowserSupport();
  if (!support.supported) {
    console.warn('Browser compatibility issues detected:', support.issues);
    
    // Add a warning for users with unsupported browsers
    const root = document.getElementById('root');
    if (root && root.firstChild) {
      const warningEl = document.createElement('div');
      warningEl.style.padding = '8px';
      warningEl.style.background = '#fff3cd';
      warningEl.style.color = '#856404';
      warningEl.style.borderRadius = '4px';
      warningEl.style.margin = '8px';
      warningEl.style.textAlign = 'center';
      warningEl.innerHTML = 'Your browser may have compatibility issues with this application. For best experience, use Chrome, Firefox, or Edge.';
      root.insertBefore(warningEl, root.firstChild);
    }
  }
}, 2000);
