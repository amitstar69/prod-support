
import React, { useState } from 'react';
import { useAuth } from '../../contexts/auth';
import { LogOut } from 'lucide-react';
import { toast } from 'sonner';

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

  const handleLogout = async () => {
    if (isLoggingOut) return; // Prevent multiple clicks
    
    setIsLoggingOut(true);
    console.log('LogoutButton: Initiating logout...');
    
    try {
      await logout();
      // Note: We don't need to show success toast here since logoutUser already does that
    } catch (error) {
      console.error('LogoutButton: Error logging out:', error);
      toast.error('Failed to log out. Please try again.');
      setIsLoggingOut(false); // Only reset if there's an error, otherwise navigation happens
    }
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className={`p-2 text-muted-foreground hover:text-foreground transition-colors ${className}`}
        aria-label="Log out"
      >
        <LogOut size={18} />
      </button>
    );
  }

  if (variant === 'text') {
    return (
      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className={`text-muted-foreground hover:text-foreground transition-colors ${className}`}
      >
        Log Out
      </button>
    );
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
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
    </button>
  );
};

export default LogoutButton;
