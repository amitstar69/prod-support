
// Export core authentication functionality
export * from './authLogin';
export * from './authHook';
export * from './authUtils';
export * from './authRegister';
export * from './authProfileData';
export * from './AuthStateProvider';
export * from './types';

// Export user data functions
export { getCurrentUserData, updateUserData, invalidateUserDataCache } from './userDataFetching';
export { updateUserData as updateUserDataDirect } from './userDataUpdates';

// Export registration functions
export { register } from './registration';

// Export debug functions that are used in RegisterPage.tsx
export { debugCheckProfileExists, debugCreateProfile } from './authDebug';
