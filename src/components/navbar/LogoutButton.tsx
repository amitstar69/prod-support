
import React, { useState } from 'react';
import { useAuth } from '../../contexts/auth';
import { LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

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

  const handleLogout = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent the event from bubbling up
    
    if (isLoggingOut) return; // Prevent multiple clicks
    
    setIsLoggingOut(true);
    console.log('LogoutButton: Initiating logout...');
    
    try {
      // First remove auth state from localStorage to ensure UI updates immediately
      localStorage.removeItem('authState');
      
      // Then trigger the logout flow
      await logout();
      
      // Redirect to home page
      window.location.href = '/';
    } catch (error) {
      console.error('LogoutButton: Error logging out:', error);
      toast.error('Failed to log out. Please try again.');
      
      // Force a refresh as fallback
      window.location.href = '/';
    } finally {
      setIsLoggingOut(false);
    }
  };

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
          Logout
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
      <span>Log Out</span>
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
