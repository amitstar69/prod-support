
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/auth';
import { toast } from 'sonner';
import ProtectedProfileRoute from './ProtectedProfileRoute';
import { getUserHomeRoute, debugCheckProfile, debugCreateMissingProfiles } from '../contexts/auth/authUtils';

interface ProtectedRouteProps {
  children: React.ReactNode;
  userType?: 'developer' | 'client'; // Deprecated, use requiredUserType instead
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
  
  const { isAuthenticated, userType: authUserType, userId, isLoading } = useAuth();
  const location = useLocation();
  const [isVerifying, setIsVerifying] = useState(true);
  const [routeResolved, setRouteResolved] = useState(false);
  
  useEffect(() => {
    // Show toast when redirecting because of wrong user type
    if (isAuthenticated && actualRequiredUserType && authUserType !== actualRequiredUserType) {
      toast.error(`This page is only accessible to ${actualRequiredUserType}s.`, {
        id: `user-type-mismatch-${actualRequiredUserType}`
      });
      console.log(`User type mismatch: Required ${actualRequiredUserType}, got ${authUserType}, path: ${location.pathname}`);
    }
  }, [isAuthenticated, actualRequiredUserType, authUserType, location.pathname]);

  // Log what's happening with auth for debugging
  useEffect(() => {
    console.log(`Protected Route (${location.pathname}):`, {
      isAuthenticated,
      authUserType,
      userId, 
      requiredType: actualRequiredUserType,
      allowPublicAccess,
      isLoading,
      isVerifying
    });
  }, [isAuthenticated, authUserType, userId, actualRequiredUserType, allowPublicAccess, location.pathname, isLoading, isVerifying]);

  // Verify profile consistency when needed
  useEffect(() => {
    const verifyUserProfile = async () => {
      if (!isAuthenticated || !userId || allowPublicAccess) {
        setIsVerifying(false);
        return;
      }
      
      try {
        // Check if profiles exist and are consistent
        const profileCheck = await debugCheckProfile(userId);
        
        if (!profileCheck.complete) {
          console.warn("Profile check found incomplete profile state:", profileCheck);
          
          // Only attempt auto-repair if we know the user type
          if (authUserType) {
            const repairResult = await debugCreateMissingProfiles(
              userId,
              authUserType,
              "", // Will be fetched from auth if needed
              ""  // Will be fetched from auth if needed
            );
            
            console.log("Profile repair attempt result:", repairResult);
            
            if (!repairResult.success) {
              toast.error("There was a problem with your profile. Please try logging out and back in.");
            }
          }
        }
      } catch (error) {
        console.error("Error in profile verification:", error);
      } finally {
        setIsVerifying(false);
        setRouteResolved(true);
      }
    };
    
    if (!isLoading) {
      verifyUserProfile();
    }
  }, [isLoading, isAuthenticated, userId, authUserType, allowPublicAccess]);

  // Loading state
  if (isLoading || isVerifying) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Allow public access routes to be viewed by anyone
  if (allowPublicAccess) {
    return <>{children}</>;
  }

  // Redirect unauthenticated users to login
  if (!isAuthenticated) {
    return <Navigate to={`/login?returnTo=${encodeURIComponent(location.pathname)}`} state={{ returnTo: location.pathname }} replace />;
  }

  // Redirect to appropriate dashboard if wrong user type
  if (actualRequiredUserType && authUserType !== actualRequiredUserType) {
    const redirectPath = getUserHomeRoute(authUserType);
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
