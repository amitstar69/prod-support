
import { initKeyboardShortcuts, checkBrowserCompatibility } from './keyboardShortcuts';
import { initStuckStateDetection, setGlobalLoadingTimeout } from './stuckStateDetection';
import { attemptRecovery, performEmergencyLogout } from './emergencyLogout';
import { 
  checkNetworkStatus, 
  attemptNetworkRecovery, 
  clearAppCache, 
  performFullRecovery 
} from './networkRecovery';

/**
 * Emergency recovery utility that provides a way to escape from frozen states
 * and recover from various error conditions.
 */
export const initEmergencyRecovery = (): (() => void) => {
  console.log('Emergency recovery initialized');
  
  // Initialize all recovery sub-systems
  const keyboardCleanup = initKeyboardShortcuts();
  const stuckStateCleanup = initStuckStateDetection();
  
  // Check browser compatibility
  checkBrowserCompatibility();
  
  // Return combined cleanup function
  return () => {
    keyboardCleanup();
    stuckStateCleanup();
  };
};

// Export all utility functions for use by other modules
export {
  setGlobalLoadingTimeout,
  performEmergencyLogout,
  attemptRecovery,
  checkNetworkStatus,
  attemptNetworkRecovery,
  clearAppCache,
  performFullRecovery
};
