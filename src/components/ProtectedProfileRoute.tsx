
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../contexts/auth';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface ProtectedProfileRouteProps {
  children: React.ReactNode;
  requiredCompletionPercentage?: number;
}

/**
 * Component that checks for profile completion before allowing access
 */
const ProtectedProfileRoute: React.FC<ProtectedProfileRouteProps> = ({ 
  children, 
  requiredCompletionPercentage = 50 
}) => {
  const { isAuthenticated, userType, userId } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const location = useLocation();
  
  useEffect(() => {
    const fetchProfileCompletion = async () => {
      if (!isAuthenticated || !userId || !userType) {
        setIsLoading(false);
        return;
      }
      
      try {
        let query;
        if (userType === 'developer') {
          query = supabase
            .from('developer_profiles')
            .select('*')
            .eq('id', userId)
            .single();
        } else {
          query = supabase
            .from('client_profiles')
            .select('profile_completion_percentage')
            .eq('id', userId)
            .single();
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error('Error fetching profile completion:', error);
          setIsLoading(false);
          return;
        }
        
        if (data) {
          const completion = userType === 'client' 
            ? data.profile_completion_percentage || 0
            : calculateDeveloperProfileCompletion(data);
            
          setProfileCompletion(completion);
        }
      } catch (error) {
        console.error('Error checking profile completion:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfileCompletion();
  }, [isAuthenticated, userType, userId]);
  
  // Calculate developer profile completion based on filled fields
  const calculateDeveloperProfileCompletion = (profile: any): number => {
    if (!profile) return 0;
    
    const requiredFields = ['skills', 'category', 'experience', 'hourly_rate'];
    const optionalFields = ['portfolio_items', 'certifications', 'education', 'languages_spoken'];
    
    let completedRequiredFields = 0;
    let completedOptionalFields = 0;
    
    // Check required fields (70% weight)
    requiredFields.forEach(field => {
      const value = profile[field];
      if (Array.isArray(value) ? value.length > 0 : !!value) {
        completedRequiredFields++;
      }
    });
    
    // Check optional fields (30% weight)
    optionalFields.forEach(field => {
      const value = profile[field];
      if (Array.isArray(value) ? value.length > 0 : !!value) {
        completedOptionalFields++;
      }
    });
    
    const requiredPercentage = (completedRequiredFields / requiredFields.length) * 70;
    const optionalPercentage = (completedOptionalFields / optionalFields.length) * 30;
    
    return Math.round(requiredPercentage + optionalPercentage);
  };
  
  // Determine if the current route is an onboarding or profile route
  const isProfileRoute = 
    location.pathname.includes('/onboarding') ||
    location.pathname.includes('/profile') ||
    location.pathname.includes('-profile');
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Checking profile status...</p>
        </div>
      </div>
    );
  }
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ returnTo: location.pathname }} replace />;
  }
  
  // Allow access to profile routes regardless of completion
  if (isProfileRoute) {
    return <>{children}</>;
  }
  
  // If profile not complete, redirect to onboarding
  if (profileCompletion < requiredCompletionPercentage) {
    const onboardingPath = userType === 'developer' ? '/onboarding/developer' : '/onboarding/client';
    toast.warning(`Please complete your profile (${profileCompletion}% complete)`);
    return <Navigate to={onboardingPath} state={{ returnTo: location.pathname }} replace />;
  }
  
  // Allow access if profile is sufficiently complete
  return <>{children}</>;
};

export default ProtectedProfileRoute;
