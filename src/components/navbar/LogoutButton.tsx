
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/auth';
import { LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { performEmergencyLogout } from '../../utils/emergencyRecovery';

interface LogoutButtonProps {
  variant?: 'icon' | 'text' | 'full';
  className?: string;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ 
  variant = 'full',
  className = ''
}) => {
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutTimeoutId, setLogoutTimeoutId] = useState<NodeJS.Timeout | null>(null);
  
  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (logoutTimeoutId) {
        clearTimeout(logoutTimeoutId);
      }
    };
  }, [logoutTimeoutId]);

  const handleLogout = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent the event from bubbling up
    
    if (isLoggingOut) {
      // If already logging out and user clicks again, perform emergency logout
      console.warn('User forced emergency logout during normal logout');
      performEmergencyLogout();
      return;
    }
    
    setIsLoggingOut(true);
    console.log('LogoutButton: Initiating logout...');
    
    // First remove auth state from localStorage to ensure UI updates immediately
    localStorage.removeItem('authState');
    
    // Set a timeout to perform emergency logout if normal logout takes too long
    const timeoutId = setTimeout(() => {
      console.warn('Logout taking too long, performing emergency logout');
      performEmergencyLogout();
    }, 5000); // 5 seconds timeout
    
    setLogoutTimeoutId(timeoutId);
    
    try {
      // Attempt graceful logout first
      await Promise.race([
        logout(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Logout timed out')), 4000)
        )
      ]);
      
      // Clear timeout if successful
      if (logoutTimeoutId) {
        clearTimeout(logoutTimeoutId);
        setLogoutTimeoutId(null);
      }
      
      // Redirect to home page
      window.location.href = '/';
    } catch (error) {
      console.error('LogoutButton: Error logging out:', error);
      toast.error('Failed to log out normally. Forcing logout...');
      
      // Force an emergency logout as fallback
      performEmergencyLogout();
    } finally {
      // Clear timeout if we reach this point
      if (logoutTimeoutId) {
        clearTimeout(logoutTimeoutId);
        setLogoutTimeoutId(null);
      }
      setIsLoggingOut(false);
    }
  };

  // Render the appropriate button based on variant
  if (variant === 'icon') {
    return (
      <Button
        onClick={handleLogout}
        disabled={isLoggingOut}
        variant="ghost"
        size="icon"
        className={`p-2 text-muted-foreground hover:text-foreground transition-colors ${className}`}
        aria-label="Log out"
      >
        <LogOut size={18} />
        {isLoggingOut && (
          <span className="absolute -top-1 -right-1 h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        )}
      </Button>
    );
  }

  if (variant === 'text') {
    return (
      <Button
        onClick={handleLogout}
        disabled={isLoggingOut}
        variant="ghost"
        className={`text-muted-foreground hover:text-foreground transition-colors ${className}`}
      >
        <span className="flex items-center">
          <LogOut className="h-4 w-4 mr-2" />
          {isLoggingOut ? 'Logging out...' : 'Logout'}
          {isLoggingOut && (
            <svg className="animate-spin ml-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
        </span>
      </Button>
    );
  }

  return (
    <Button
      onClick={handleLogout}
      disabled={isLoggingOut}
      variant="ghost"
      className={`flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors ${className}`}
    >
      <LogOut size={18} />
      <span>{isLoggingOut ? 'Logging out...' : 'Log Out'}</span>
      {isLoggingOut && (
        <svg className="animate-spin ml-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
    </Button>
  );
};

export default LogoutButton;
