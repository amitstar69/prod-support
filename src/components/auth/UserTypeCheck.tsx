
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/auth';
import { getUserHomeRoute } from '../../contexts/auth/authUtils';

interface UserTypeCheckProps {
  children: React.ReactNode;
  requiredUserType?: 'developer' | 'client';
  allowedUserTypes?: ('developer' | 'client')[];
}

const UserTypeCheck: React.FC<UserTypeCheckProps> = ({
  children,
  requiredUserType,
  allowedUserTypes
}) => {
  const { userType: authUserType } = useAuth();
  
  // Debug log to help identify user type issues
  console.log('[UserTypeCheck] Checking user access:', { 
    authUserType, 
    requiredUserType,
    allowedUserTypes
  });
  
  // If no specific user type is required and no allowed types specified, allow access
  if (!requiredUserType && !allowedUserTypes) {
    return <>{children}</>;
  }
  
  // Check against multiple allowed user types if specified
  if (allowedUserTypes && allowedUserTypes.length > 0) {
    if (authUserType && allowedUserTypes.includes(authUserType)) {
      return <>{children}</>;
    }
    // If not in allowed types, redirect to appropriate dashboard
    const redirectPath = getUserHomeRoute(authUserType);
    console.log(`[UserTypeCheck] Access denied. Redirecting to ${redirectPath}`);
    return <Navigate to={redirectPath} replace />;
  }
  
  // Traditional single user type check (backward compatibility)
  if (requiredUserType && authUserType !== requiredUserType) {
    const redirectPath = getUserHomeRoute(authUserType);
    console.log(`[UserTypeCheck] Access denied. Redirecting to ${redirectPath}`);
    return <Navigate to={redirectPath} replace />;
  }

  // Correct user type - render children
  return <>{children}</>;
};

export default UserTypeCheck;
