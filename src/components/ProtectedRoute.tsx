
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/auth';
import { toast } from 'sonner';
import { supabase } from '../integrations/supabase/client';

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
  const [isVerifying, setIsVerifying] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const verifySession = async () => {
      // Check if we have valid Supabase session
      const { data, error } = await supabase.auth.getSession();
      
      console.log('[ProtectedRoute] Verifying session:', { 
        hasSession: !!data.session,
        contextAuth: isAuthenticated,
        userType
      });
      
      if (error) {
        console.error('[ProtectedRoute] Error verifying session:', error);
        setHasAccess(false);
        setIsVerifying(false);
        return;
      }
      
      // Allow public access routes to be viewed by anyone
      if (allowPublicAccess) {
        setHasAccess(true);
        setIsVerifying(false);
        return;
      }
      
      // No valid session = no access
      if (!data.session) {
        setHasAccess(false);
        setIsVerifying(false);
        return;
      }
      
      // If required user type is specified, check if current user has that type
      if (requiredUserType) {
        try {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('user_type')
            .eq('id', data.session.user.id)
            .maybeSingle();
          
          if (profileData && profileData.user_type === requiredUserType) {
            setHasAccess(true);
          } else {
            console.log(`[ProtectedRoute] User is not a ${requiredUserType}, redirecting`);
            toast.error(`This page is only accessible to ${requiredUserType}s.`);
            setHasAccess(false);
          }
        } catch (err) {
          console.error('[ProtectedRoute] Error checking user type:', err);
          setHasAccess(false);
        }
      } else {
        // Just need to be authenticated
        setHasAccess(true);
      }
      
      setIsVerifying(false);
    };
    
    verifySession();
  }, [isAuthenticated, userType, allowPublicAccess, requiredUserType]);

  // Loading state while verifying
  if (isVerifying) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-pulse text-center">
          <h2 className="text-2xl font-semibold mb-4">Verifying access...</h2>
          <p className="text-gray-500">Please wait</p>
        </div>
      </div>
    );
  }

  // If public access is allowed, render the children
  if (allowPublicAccess) {
    return <>{children}</>;
  }

  // Redirect unauthenticated users to login
  if (!hasAccess) {
    return <Navigate to="/login" state={{ returnTo: location.pathname }} replace />;
  }

  // User is authenticated and has the correct role
  return <>{children}</>;
};

export default ProtectedRoute;
