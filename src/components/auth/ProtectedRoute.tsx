
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/auth';
import { supabase } from '../../integrations/supabase/client';
import { Skeleton } from '../ui/skeleton';
import { ProfileCompletionBanner } from '../profile/ProfileCompletionBanner';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  requireProfileCompletion?: boolean;
  minCompletionPercentage?: number;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireProfileCompletion = false,
  minCompletionPercentage = 50
}) => {
  const { isAuthenticated, userType, isLoading } = useAuth();
  const location = useLocation();
  const [profileCompletionPercentage, setProfileCompletionPercentage] = useState<number | null>(null);
  const [checkingCompletion, setCheckingCompletion] = useState(requireProfileCompletion);
  
  // Check profile completion if required
  useEffect(() => {
    const checkProfileCompletion = async () => {
      if (requireProfileCompletion && isAuthenticated) {
        setCheckingCompletion(true);
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('profileCompletionPercentage')
            .eq('id', (await supabase.auth.getUser()).data.user?.id)
            .single();
            
          if (!error && data) {
            setProfileCompletionPercentage(data.profileCompletionPercentage || 0);
          } else {
            // Default to 0 if we can't get the percentage
            setProfileCompletionPercentage(0);
          }
        } catch (err) {
          console.error('Error checking profile completion:', err);
          setProfileCompletionPercentage(0);
        } finally {
          setCheckingCompletion(false);
        }
      } else {
        setCheckingCompletion(false);
      }
    };
    
    checkProfileCompletion();
  }, [isAuthenticated, requireProfileCompletion]);
  
  // Show loading state while checking auth
  if (isLoading || checkingCompletion) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-4">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-32 w-full mb-2" />
          <Skeleton className="h-24 w-full mb-4" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to={`/login?returnTo=${encodeURIComponent(location.pathname)}`} replace />;
  }
  
  // If profile completion is required but not met, show warning banner
  if (requireProfileCompletion && 
      profileCompletionPercentage !== null && 
      profileCompletionPercentage < minCompletionPercentage) {
    const completionPathMap = {
      'developer': '/onboarding/developer',
      'client': '/onboarding/client'
    };
    
    // Only redirect if we're not already on the completion path
    const completionPath = userType ? completionPathMap[userType] : '/';
    if (location.pathname !== completionPath) {
      return <Navigate to={completionPath} replace />;
    }
  }
  
  // If profile completion percentage is available but not critical, show banner but allow access
  const showBanner = profileCompletionPercentage !== null && 
                     profileCompletionPercentage < 80 &&
                     profileCompletionPercentage >= minCompletionPercentage;
  
  // Authenticated and meets minimum requirements
  return (
    <>
      {showBanner && userType && (
        <ProfileCompletionBanner 
          completionPercentage={profileCompletionPercentage} 
          userType={userType}
        />
      )}
      {children || <Outlet />}
    </>
  );
};

export default ProtectedRoute;
