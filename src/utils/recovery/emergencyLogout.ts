
import { toast } from 'sonner';

/**
 * Try to recover the app from a stuck state
 */
export const attemptRecovery = (): void => {
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

/**
 * Function to completely reset the application state and return to the home page
 */
export const performEmergencyLogout = (): void => {
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
