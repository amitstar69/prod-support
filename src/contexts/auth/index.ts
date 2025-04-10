
// Export all auth related functionality
import { useAuth } from './authHook';
import { AuthProvider } from './AuthStateProvider';
import { getCurrentUserData, invalidateUserDataCache } from './userDataFetching';
import { logoutUser } from './authUtils';
import { updateUserData } from './userDataUpdater';

export { 
  useAuth,
  AuthProvider,
  getCurrentUserData,
  logoutUser,
  updateUserData,
  invalidateUserDataCache
};

// Default export for backward compatibility
export default useAuth;
