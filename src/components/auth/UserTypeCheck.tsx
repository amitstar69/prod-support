
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/auth';
import { getUserHomeRoute } from '../../contexts/auth/authUtils';

interface UserTypeCheckProps {
  children: React.ReactNode;
  requiredUserType?: 'developer' | 'client';
}

const UserTypeCheck: React.FC<UserTypeCheckProps> = ({
  children,
  requiredUserType
}) => {
  const { userType: authUserType } = useAuth();
  
  // If no specific user type is required, allow access
  if (!requiredUserType) {
    return <>{children}</>;
  }

  // Redirect to appropriate dashboard if wrong user type
  if (authUserType !== requiredUserType) {
    const redirectPath = getUserHomeRoute(authUserType);
    return <Navigate to={redirectPath} replace />;
  }

  // Correct user type - render children
  return <>{children}</>;
};

export default UserTypeCheck;
