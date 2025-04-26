
import { useContext } from 'react';
import { AuthContext } from './AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  // Add logging to help debug user type issues
  console.log('[useAuth] Current auth context:', {
    isAuthenticated: context.isAuthenticated,
    userType: context.userType,
    userId: context.userId
  });
  
  return context;
};
