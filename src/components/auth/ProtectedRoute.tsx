
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/auth';
import { supabase } from '../../integrations/supabase/client';
import { Skeleton } from '../ui/skeleton';
import ProfileCompletionBanner from '../profile/ProfileCompletionBanner';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  requireProfileCompletion?: boolean;
  minCompletionPercentage?: number;
  requiredUserType?: 'developer' | 'client';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireProfileCompletion = false,
  minCompletionPercentage = 50,
  requiredUserType
}) => {
  const { isAuthenticated, userType, isLoading, userId } = useAuth();
  const location = useLocation();
  const [profileCompletionPercentage, setProfileCompletionPercentage] = useState<number | null>(null);
  const [checkingCompletion, setCheckingCompletion] = useState(requireProfileCompletion);
  
  useEffect(() => {
    // Debug logging for auth state
    console.log(`Auth ProtectedRoute (${location.pathname}):`, { 
      isAuthenticated, 
      userType, 
      isLoading,
      requireProfileCompletion,
      requiredUserType
    });
  }, [isAuthenticated, userType, isLoading, requireProfileCompletion, requiredUserType, location.pathname]);
  
  useEffect(() => {
    const checkProfileCompletion = async () => {
      if (requireProfileCompletion && isAuthenticated) {
        setCheckingCompletion(true);
        try {
          const userId = (await supabase.auth.getUser()).data.user?.id;
          
          let data, error;
          
          if (userType === 'developer') {
            const result = await supabase
              .from('developer_profiles')
              .select('profile_completion_percentage')
              .eq('id', userId)
              .single();
            data = result.data;
            error = result.error;
          } else {
            const result = await supabase
              .from('client_profiles')
              .select('profile_completion_percentage')
              .eq('id', userId)
              .single();
            data = result.data;
            error = result.error;
          }
            
          if (!error && data) {
            setProfileCompletionPercentage(data.profile_completion_percentage || 0);
          } else {
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
  }, [isAuthenticated, requireProfileCompletion, userType]);
  
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
  
  if (!isAuthenticated) {
    return <Navigate to={`/login?returnTo=${encodeURIComponent(location.pathname)}`} replace />;
  }
  
  // If a specific user type is required, check it
  if (requiredUserType && userType !== requiredUserType) {
    const redirectPath = userType === 'developer' ? '/developer-dashboard' : '/client-dashboard';
    return <Navigate to={redirectPath} replace />;
  }
  
  if (requireProfileCompletion && 
      profileCompletionPercentage !== null && 
      profileCompletionPercentage < minCompletionPercentage) {
    const completionPathMap = {
      'developer': '/onboarding/developer',
      'client': '/onboarding/client'
    };
    
    const completionPath = userType ? completionPathMap[userType] : '/';
    if (location.pathname !== completionPath) {
      return <Navigate to={completionPath} replace />;
    }
  }
  
  const showBanner = profileCompletionPercentage !== null && 
                     profileCompletionPercentage < 80 &&
                     profileCompletionPercentage >= minCompletionPercentage;
  
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
