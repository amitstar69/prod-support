
import { UserType } from '../contexts/auth/types';

// Cache of resolved routes to avoid repeated calculations
const routeCache: Record<string, string> = {};

// Map user types to their primary landing URLs
export const getUserHomePage = (userType: UserType | null): string => {
  const cacheKey = `home_${userType || 'null'}`;
  
  if (routeCache[cacheKey]) {
    return routeCache[cacheKey];
  }
  
  let route = '/';
  if (userType === 'developer') {
    route = '/developer';
  } else if (userType === 'client') {
    route = '/client';
  }
  
  routeCache[cacheKey] = route;
  return route;
};

// Map specific dashboard routes
export const getUserDashboardPage = (userType: UserType | null): string => {
  const cacheKey = `dashboard_${userType || 'null'}`;
  
  if (routeCache[cacheKey]) {
    return routeCache[cacheKey];
  }
  
  let route = '/login';
  if (userType === 'developer') {
    route = '/developer/dashboard';
  } else if (userType === 'client') {
    route = '/client/dashboard';
  }
  
  routeCache[cacheKey] = route;
  return route;
};

// Get the sessions history page for the user type
export const getSessionsHistoryPage = (userType: UserType | null): string => {
  const cacheKey = `sessions_${userType || 'null'}`;
  
  if (routeCache[cacheKey]) {
    return routeCache[cacheKey];
  }
  
  let route = '/login';
  if (userType === 'developer') {
    route = '/developer/sessions';
  } else if (userType === 'client') {
    route = '/client/sessions';
  }
  
  routeCache[cacheKey] = route;
  return route;
};

// Check if current path belongs to user type - with performance optimization
export const isCorrectUserPath = (
  path: string, 
  userType: UserType | null
): boolean => {
  if (!userType) return true; // Non-authenticated users can access public routes
  
  // Special case for root path - always allow
  if (path === '/') return true;
  
  // Fast check for common routes
  if (path === '/search' || path.startsWith('/product/') || path.startsWith('/developer-profiles/')) {
    return true;
  }
  
  // Check if the path matches the user type prefix
  return userType === 'developer' 
    ? path.startsWith('/developer') 
    : path.startsWith('/client');
};

// Check if a route should be marked active based on current path
export const isRouteActive = (routePath: string, currentPath: string): boolean => {
  // Handle exact matches
  if (routePath === currentPath) {
    return true;
  }
  
  // Handle user type home page special cases
  if ((routePath === '/developer/dashboard' && currentPath === '/developer') ||
      (routePath === '/client/dashboard' && currentPath === '/client')) {
    return true;
  }
  
  // Handle section matches (e.g. /developer/tickets/123 should highlight /developer/tickets)
  if (routePath !== '/' && currentPath.startsWith(routePath)) {
    // Make sure it's a section match (e.g. /developer/tickets should match /developer/tickets/123)
    // but /developer should not match /developer/tickets
    const nextChar = currentPath.substring(routePath.length, routePath.length + 1);
    return nextChar === '' || nextChar === '/';
  }
  
  return false;
};

// Force navigation if needed (for critical redirects)
export const performNavigation = (url: string): void => {
  try {
    // Use this for emergency navigation when normal router isn't working
    window.location.href = url;
  } catch (error) {
    console.error('Navigation error:', error);
    // Last resort - force reload to home
    window.location.href = '/';
  }
};
