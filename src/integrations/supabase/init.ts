
import { initStorage } from './storage';
import { checkStorageBuckets } from './client';

/**
 * Initialize all Supabase services
 * Should be called once at app startup
 */
export const initSupabase = async () => {
  console.log('Initializing Supabase services...');
  
  // Check storage buckets
  const storageAvailable = await checkStorageBuckets();
  
  // Initialize storage if available
  if (storageAvailable) {
    await initStorage();
  } else {
    console.warn('Storage services not available');
  }
  
  console.log('Supabase services initialization complete');
  return true;
};

// Auto-initialize on import
initSupabase().catch(err => {
  console.error('Failed to initialize Supabase services:', err);
});
