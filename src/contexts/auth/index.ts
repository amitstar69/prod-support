
// Export all auth related functionality
import { useAuth } from './authHook';
import { AuthProvider, AuthStateProvider } from './AuthStateProvider';
import { invalidateUserDataCache, getCurrentUserData } from './userDataFetching';
import { logoutUser } from './authUtils';
import { updateUserData } from './userDataUpdater';

export { 
  useAuth,
  AuthProvider,
  AuthStateProvider,
  invalidateUserDataCache,
  logoutUser,
  getCurrentUserData,
  updateUserData
};

// Default export for backward compatibility
export default useAuth;
