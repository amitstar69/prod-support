
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/auth';
import { Roles } from '../../types/roles';

interface RoleBasedGuardProps {
  children: React.ReactNode;
  roles: Roles[];
}

const RoleBasedGuard: React.FC<RoleBasedGuardProps> = ({ children, roles }) => {
  const { userType } = useAuth();
  
  const hasRequiredRole = roles.includes(userType as Roles);
  
  if (!hasRequiredRole) {
    // Redirect to home if the user doesn't have the required role
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

export default RoleBasedGuard;
