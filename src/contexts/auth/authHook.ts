
import { useContext } from 'react';
import { AuthContext } from './AuthStateProvider';
import { AuthContextType } from './types';

// Export the useAuth hook that allows components to access the auth context
export const useAuth = (): AuthContextType => {
  const authContext = useContext(AuthContext);
  
  if (authContext === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return authContext;
};
