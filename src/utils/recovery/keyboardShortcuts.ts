
import { performEmergencyLogout } from './emergencyLogout';
import { toast } from 'sonner';

/**
 * Initializes keyboard shortcuts for emergency actions
 * @returns Cleanup function to remove event listeners
 */
export const initKeyboardShortcuts = (): (() => void) => {
  console.log('Emergency keyboard shortcuts initialized');
  
  // Listen for Escape key + L key pressed together (emergency logout)
  const handleKeyDown = (event: KeyboardEvent) => {
    // Check for Alt + L as the emergency logout combination
    if (event.altKey && event.key.toLowerCase() === 'l') {
      console.log('Emergency recovery triggered via keyboard shortcut');
      performEmergencyLogout();
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('keydown', handleKeyDown);
  };
};

/**
 * Sets up browser compatibility check
 */
export const checkBrowserCompatibility = () => {
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
