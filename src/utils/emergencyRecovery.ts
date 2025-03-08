
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
      console.log('Emergency logout triggered via keyboard shortcut');
      performEmergencyLogout();
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('keydown', handleKeyDown);
  };
};

// Add a global timeout that will clear loading states if they persist too long
export const setGlobalLoadingTimeout = (resetFn: () => void, timeoutMs = 15000) => {
  const timeoutId = setTimeout(() => {
    console.warn('Global loading timeout reached, resetting application state');
    resetFn();
    toast.error('The operation is taking longer than expected. Application state has been reset.');
  }, timeoutMs);
  
  return timeoutId;
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
    
    // Show a notification
    toast.info('Emergency logout performed. Redirecting to home page...');
    
    // Force page reload after a slight delay to allow toast to be seen
    setTimeout(() => {
      window.location.href = '/';
    }, 1000);
  } catch (error) {
    console.error('Error during emergency logout:', error);
    
    // Absolute fallback: direct navigation
    window.location.href = '/';
  }
};
