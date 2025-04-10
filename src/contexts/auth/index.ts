
// Export all auth related functionality
import { useAuth } from './authHook';
import { AuthProvider } from './AuthStateProvider';
import { getCurrentUserData } from './userDataFetching';
import { logoutUser } from './authUtils';
import { updateUserData } from './userDataUpdater';

export { 
  useAuth,
  AuthProvider,
  getCurrentUserData,
  logoutUser,
  updateUserData
};

// Default export for backward compatibility
export default useAuth;
