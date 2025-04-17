
import { UserType } from '../contexts/auth/types';

// Map user types to their primary landing URLs
export const getUserHomePage = (userType: UserType | null): string => {
  if (!userType) return '/';
  
  return userType === 'developer' ? '/developer' : '/client';
};

// Map specific dashboard routes
export const getUserDashboardPage = (userType: UserType | null): string => {
  if (!userType) return '/login';
  
  return userType === 'developer' ? '/developer/dashboard' : '/client/dashboard';
};

// Get the sessions history page for the user type
export const getSessionsHistoryPage = (userType: UserType | null): string => {
  if (!userType) return '/login';
  
  return userType === 'developer' ? '/developer/sessions' : '/client/sessions';
};

// Check if current path belongs to user type
export const isCorrectUserPath = (
  path: string, 
  userType: UserType | null
): boolean => {
  if (!userType) return true; // Non-authenticated users can access public routes
  
  // Special case for root path - always allow
  if (path === '/') return true;
  
  // Check if the path matches the user type prefix
  return userType === 'developer' 
    ? path.startsWith('/developer') 
    : path.startsWith('/client');
};
