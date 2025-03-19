import { AuthState } from './types';
import { AuthContextType } from './types';

// Import the authentication provider
import { AuthStateProvider } from './AuthStateProvider';
import { useAuth } from './authHook';

// Import the user data fetching functions
import { getCurrentUserData, invalidateUserDataCache } from './userDataFetching';
import { updateUserData } from './userDataUpdates';

// Export auth context and hook
export { AuthStateProvider } from './AuthStateProvider';
export { useAuth } from './authHook';

// Export user data functions
export { getCurrentUserData, updateUserData, invalidateUserDataCache };

export type { AuthState, AuthContextType };
