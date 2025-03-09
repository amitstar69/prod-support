
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
  const { isAuthenticated, userType, userId } = useAuth();
  const location = useLocation();
  const [isVerifying, setIsVerifying] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  
  useEffect(() => {
    let isMounted = true;
    
    const verifySession = async () => {
      // Allow public access routes to be viewed by anyone
      if (allowPublicAccess) {
        if (isMounted) {
          setHasAccess(true);
          setIsVerifying(false);
        }
        return;
      }
      
      try {
        console.log('[ProtectedRoute] Verifying session, current auth state:', { isAuthenticated, userType, userId });
        
        // Always verify with Supabase directly
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[ProtectedRoute] Error verifying session:', error);
          if (isMounted) {
            setHasAccess(false);
            setIsVerifying(false);
          }
          return;
        }
        
        // No valid session = no access
        if (!data.session) {
          console.log('[ProtectedRoute] No active session, redirecting to login');
          if (isMounted) {
            setHasAccess(false);
            setIsVerifying(false);
          }
          return;
        }
        
        // If required user type is specified, check if current user has that type
        if (requiredUserType) {
          try {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('user_type')
              .eq('id', data.session.user.id)
              .maybeSingle();
            
            if (profileError) {
              console.error('[ProtectedRoute] Error checking user type:', profileError);
              if (isMounted) {
                setHasAccess(false);
                setIsVerifying(false);
              }
              return;
            }
            
            console.log('[ProtectedRoute] Profile data:', profileData);
            
            if (profileData && profileData.user_type === requiredUserType) {
              console.log(`[ProtectedRoute] User is a ${requiredUserType}, access granted`);
              if (isMounted) {
                setHasAccess(true);
                setIsVerifying(false);
              }
            } else {
              console.log(`[ProtectedRoute] User is not a ${requiredUserType}, access denied`);
              if (isMounted) {
                toast.error(`This page is only accessible to ${requiredUserType}s.`);
                setHasAccess(false);
                setIsVerifying(false);
              }
            }
          } catch (err) {
            console.error('[ProtectedRoute] Error checking user type:', err);
            if (isMounted) {
              setHasAccess(false);
              setIsVerifying(false);
            }
          }
        } else {
          // Just need to be authenticated
          if (isMounted) {
            console.log('[ProtectedRoute] User is authenticated, access granted');
            setHasAccess(true);
            setIsVerifying(false);
          }
        }
      } catch (err) {
        console.error('[ProtectedRoute] Exception during verification:', err);
        if (isMounted) {
          setHasAccess(false);
          setIsVerifying(false);
        }
      }
    };
    
    verifySession();
    
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, userType, allowPublicAccess, requiredUserType, location.pathname, userId]);

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

  // Redirect unauthenticated users to login with current path stored
  if (!hasAccess) {
    console.log(`[ProtectedRoute] Access denied, redirecting to login with return path: ${location.pathname}`);
    return <Navigate to="/login" state={{ returnTo: location.pathname }} replace />;
  }

  // User is authenticated and has the correct role
  console.log('[ProtectedRoute] Access granted, rendering children');
  return <>{children}</>;
};

export default ProtectedRoute;
