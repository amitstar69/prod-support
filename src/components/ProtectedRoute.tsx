import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredUserType?: 'developer' | 'client';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredUserType 
}) => {
  const { isAuthenticated, userType } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredUserType && userType !== requiredUserType) {
    // If a specific user type is required but the current user is of a different type
    // Redirect to the appropriate dashboard based on user type
    return <Navigate to={userType === 'developer' ? '/profile' : '/client-profile'} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
