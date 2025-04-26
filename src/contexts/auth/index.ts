
// Export all components and hooks from the auth context
export { AuthContext } from './AuthContext';
export { AuthProvider } from './AuthStateProvider';
export { useAuth } from './authHook';
export { logoutUser, checkSupabaseSession, getUserHomeRoute, debugCheckProfile, debugCreateMissingProfiles } from './authUtils';
export { getCurrentUserData, updateUserData, invalidateUserDataCache } from './userDataFetching';
