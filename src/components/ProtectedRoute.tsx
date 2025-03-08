
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredUserType?: 'developer' | 'client';
  allowPublicAccess?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredUserType,
  allowPublicAccess = false
}) => {
  const { isAuthenticated, userType } = useAuth();

  if (allowPublicAccess) {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredUserType && userType !== requiredUserType) {
    return <Navigate to={userType === 'developer' ? '/profile' : '/client-profile'} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
