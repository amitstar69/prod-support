
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/auth';
import { toast } from 'sonner';

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
  const location = useLocation();

  useEffect(() => {
    // Show toast when redirecting because of wrong user type
    if (isAuthenticated && requiredUserType && userType !== requiredUserType) {
      toast.error(`This page is only accessible to ${requiredUserType}s.`);
    }
  }, [isAuthenticated, requiredUserType, userType]);

  // Allow public access routes to be viewed by anyone
  if (allowPublicAccess) {
    return <>{children}</>;
  }

  // Redirect unauthenticated users to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ returnTo: location.pathname }} replace />;
  }

  // Redirect to appropriate dashboard if wrong user type
  if (requiredUserType && userType !== requiredUserType) {
    return <Navigate to={userType === 'developer' ? '/developer-dashboard' : '/client-profile'} replace />;
  }

  // User is authenticated and has the correct role
  return <>{children}</>;
};

export default ProtectedRoute;
