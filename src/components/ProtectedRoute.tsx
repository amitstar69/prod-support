
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/auth';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  element?: React.ReactElement;
  userType?: 'developer' | 'client';
  requiredUserType?: 'developer' | 'client';
  allowPublicAccess?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  element,
  userType, // This property is deprecated, use requiredUserType instead
  requiredUserType,
  allowPublicAccess = false
}) => {
  // If userType is provided but requiredUserType is not, use userType for backwards compatibility
  const actualRequiredUserType = requiredUserType || userType;
  
  const { isAuthenticated, userType: authUserType } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Show toast when redirecting because of wrong user type
    if (isAuthenticated && actualRequiredUserType && authUserType !== actualRequiredUserType) {
      toast.error(`This page is only accessible to ${actualRequiredUserType}s.`);
    }
  }, [isAuthenticated, actualRequiredUserType, authUserType]);

  // Allow public access routes to be viewed by anyone
  if (allowPublicAccess) {
    return <>{children || element}</>;
  }

  // Redirect unauthenticated users to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ returnTo: location.pathname }} replace />;
  }

  // Redirect to appropriate dashboard if wrong user type
  if (actualRequiredUserType && authUserType !== actualRequiredUserType) {
    const redirectPath = authUserType === 'developer' ? '/developer-dashboard' : '/client-dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  // User is authenticated and has the correct role
  return <>{children || element}</>;
};

export default ProtectedRoute;
