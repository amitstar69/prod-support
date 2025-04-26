
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/auth';
import { getUserHomeRoute } from '../../contexts/auth/authUtils';

interface UserTypeCheckProps {
  children: React.ReactNode;
  requiredUserType?: 'developer' | 'client';
  allowMultipleTypes?: boolean;
  allowedUserTypes?: ('developer' | 'client')[];
}

const UserTypeCheck: React.FC<UserTypeCheckProps> = ({
  children,
  requiredUserType,
  allowMultipleTypes = false,
  allowedUserTypes = []
}) => {
  const { userType: authUserType } = useAuth();
  
  // If no specific user type is required, allow access
  if (!requiredUserType && !allowedUserTypes.length) {
    return <>{children}</>;
  }

  // Check if userType is in allowedUserTypes (if specified)
  if (allowMultipleTypes && allowedUserTypes.length > 0) {
    if (allowedUserTypes.includes(authUserType as 'developer' | 'client')) {
      return <>{children}</>;
    }
  }
  
  // Check single user type requirement (backward compatibility)
  else if (requiredUserType && authUserType === requiredUserType) {
    return <>{children}</>;
  }

  // Redirect to appropriate dashboard if wrong user type
  const redirectPath = getUserHomeRoute(authUserType);
  return <Navigate to={redirectPath} replace />;
};

export default UserTypeCheck;
