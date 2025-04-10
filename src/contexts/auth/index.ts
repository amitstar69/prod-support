
// Export all auth related functionality
import { useAuth } from './authHook';
import { invalidateUserDataCache } from './userDataFetching';
import { logoutUser } from './authUtils';

export { 
  useAuth,
  invalidateUserDataCache,
  logoutUser
};

// Default export for backward compatibility
export default useAuth;
