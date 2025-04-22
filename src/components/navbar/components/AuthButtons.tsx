
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../ui/button';
import { useAuth } from '../../../contexts/auth';
import { getUserHomePage } from '../../../utils/navigationUtils';

interface AuthButtonsProps {
  isMobile?: boolean;
  onAction?: () => void;
}

export const AuthButtons: React.FC<AuthButtonsProps> = ({ isMobile = false, onAction }) => {
  const { isAuthenticated, userType, logout } = useAuth();
  const homePath = getUserHomePage(userType);
  
  const handleLogout = async () => {
    await logout();
    onAction?.();
  };
  
  const getDashboardPath = () => {
    if (userType === 'client') {
      return '/client/dashboard';
    }
    return '/developer/dashboard';
  };
  
  if (isAuthenticated) {
    return (
      <div className={`flex items-center ${isMobile ? 'flex-col space-y-2' : 'space-x-2'}`}>
        <Button
          variant="ghost"
          className={isMobile ? "w-full justify-start" : ""}
          onClick={handleLogout}
        >
          Logout
        </Button>
        <Button
          className={isMobile ? "w-full justify-start" : ""}
          asChild
          onClick={onAction}
        >
          <Link to={getDashboardPath()}>
            {userType === 'developer' ? 'My Dashboard' : 'My Dashboard'}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className={`flex items-center ${isMobile ? 'flex-col space-y-2' : 'space-x-2'}`}>
      <Button
        variant="ghost"
        className={isMobile ? "w-full justify-start" : ""}
        asChild
        onClick={onAction}
      >
        <Link to="/login">Login</Link>
      </Button>
      <Button
        className={isMobile ? "w-full justify-start" : ""}
        asChild
        onClick={onAction}
      >
        <Link to="/register">Sign Up</Link>
      </Button>
    </div>
  );
};
