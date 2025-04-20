
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/auth';
import { Button } from '../ui/button';
import { LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { performEmergencyLogout } from '../../utils/recovery';

interface LogoutButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  className?: string;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ 
  variant = 'ghost',
  className = ''
}) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    console.log('LogoutButton: Initiating logout...');
    
    try {
      // Set up a fallback timeout in case logout is taking too long
      const timeoutId = setTimeout(() => {
        console.warn('Logout taking too long, performing emergency logout');
        performEmergencyLogout();
      }, 5000);
      
      // Try normal logout
      const logoutResult = await logout();
      
      // Clear the timeout if logout completed normally
      clearTimeout(timeoutId);
      
      // Check if logout was explicitly unsuccessful
      if (logoutResult === false) {
        console.info('Logout failed, performing emergency logout');
        performEmergencyLogout();
      } else {
        // Redirect to home page
        navigate('/', { replace: true });
        toast.success('You have been logged out successfully');
      }
      
    } catch (error) {
      console.error('LogoutButton: Error logging out:', error);
      performEmergencyLogout();
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Button 
      onClick={handleLogout} 
      variant={variant}
      className={`${className}`}
      disabled={isLoading}
    >
      {isLoading ? 'Logging out...' : (
        <>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </>
      )}
    </Button>
  );
};

export default LogoutButton;
