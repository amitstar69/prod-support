
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/auth';
import { toast } from 'sonner';
import ProtectedProfileRoute from './ProtectedProfileRoute';

interface ProtectedRouteProps {
  children: React.ReactNode;
  userType?: 'developer' | 'client';
  requiredUserType?: 'developer' | 'client';
  allowPublicAccess?: boolean;
  requireProfileCompletion?: boolean;
  requiredCompletionPercentage?: number;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  userType, // This property is deprecated, use requiredUserType instead
  requiredUserType,
  allowPublicAccess = false,
  requireProfileCompletion = false,
  requiredCompletionPercentage = 50
}) => {
  // If userType is provided but requiredUserType is not, use userType for backwards compatibility
  const actualRequiredUserType = requiredUserType || userType;
  
  const { isAuthenticated, userType: authUserType, userId } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Show toast when redirecting because of wrong user type
    if (isAuthenticated && actualRequiredUserType && authUserType !== actualRequiredUserType) {
      toast.error(`This page is only accessible to ${actualRequiredUserType}s.`);
      console.log(`User type mismatch: Required ${actualRequiredUserType}, got ${authUserType}, path: ${location.pathname}`);
    }
  }, [isAuthenticated, actualRequiredUserType, authUserType, location.pathname]);

  // For debugging - log what's happening with auth
  useEffect(() => {
    console.log(`Protected Route (${location.pathname}):`, {
      isAuthenticated,
      authUserType,
      userId, 
      requiredType: actualRequiredUserType,
      allowPublicAccess
    });
  }, [isAuthenticated, authUserType, userId, actualRequiredUserType, allowPublicAccess, location.pathname]);

  // Allow public access routes to be viewed by anyone
  if (allowPublicAccess) {
    return <>{children}</>;
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
  if (requireProfileCompletion) {
    return (
      <ProtectedProfileRoute requiredCompletionPercentage={requiredCompletionPercentage}>
        {children}
      </ProtectedProfileRoute>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
