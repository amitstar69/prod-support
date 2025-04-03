
import { AuthState } from './types';
import { AuthContextType } from './types';

// Import the authentication provider
import { AuthProvider, AuthStateProvider } from './AuthStateProvider';
import { useAuth } from './authHook';

// Import the user data fetching functions
import { getCurrentUserData, invalidateUserDataCache } from './userDataFetching';
import { updateUserData } from './userDataUpdates';

// Import registration functions
import { register } from './registration';

// Export debug functions for backward compatibility
import { 
  debugCheckProfileExists, 
  debugCreateProfile 
} from './authDebug';

// Export auth context and hook
export { AuthProvider, AuthStateProvider };
export { useAuth };

// Export user data functions
export { getCurrentUserData, updateUserData, invalidateUserDataCache };

// Export registration function
export { register };

// Export debug functions
export { debugCheckProfileExists, debugCreateProfile };

export type { AuthState, AuthContextType };
