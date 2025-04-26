
import React from 'react';
import { useAuth } from '../contexts/auth';
import AuthCheck from './auth/AuthCheck';
import UserTypeCheck from './auth/UserTypeCheck';
import ProtectedProfileRoute from './ProtectedProfileRoute';

interface ProtectedRouteProps {
  children: React.ReactNode;
  userType?: 'developer' | 'client'; // Deprecated, use requiredUserType instead
  requiredUserType?: 'developer' | 'client';
  allowedUserTypes?: ('developer' | 'client')[];
  allowPublicAccess?: boolean;
  requireProfileCompletion?: boolean;
  requiredCompletionPercentage?: number;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  userType, // This property is deprecated, use requiredUserType instead
  requiredUserType,
  allowedUserTypes,
  allowPublicAccess = false,
  requireProfileCompletion = false,
  requiredCompletionPercentage = 50
}) => {
  // If userType is provided but requiredUserType is not, use userType for backwards compatibility
  const actualRequiredUserType = requiredUserType || userType;
  
  const { isAuthenticated, userType: authUserType } = useAuth();
  
  // Debug log to help identify user type issues
  console.log('[ProtectedRoute] Route protection check:', { 
    isAuthenticated, 
    authUserType, 
    requiredUserType: actualRequiredUserType,
    allowedUserTypes
  });

  // Start with the auth check
  return (
    <AuthCheck 
      allowPublicAccess={allowPublicAccess}
      requiredUserType={actualRequiredUserType}
    >
      {/* Then check for correct user type, supporting multiple allowed types */}
      <UserTypeCheck 
        requiredUserType={actualRequiredUserType}
        allowedUserTypes={allowedUserTypes}
      >
        {/* Finally, check for profile completion if needed */}
        {requireProfileCompletion ? (
          <ProtectedProfileRoute requiredCompletionPercentage={requiredCompletionPercentage}>
            {children}
          </ProtectedProfileRoute>
        ) : (
          <>{children}</>
        )}
      </UserTypeCheck>
    </AuthCheck>
  );
};

export default ProtectedRoute;
