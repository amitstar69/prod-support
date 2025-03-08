
import React from 'react';
import { useAuth } from '../../contexts/auth';
import LogoutButton from './LogoutButton';
import { Button } from '@/components/ui/button';

interface NavAuthActionsProps {
  handleLoginClick: () => void;
  handleRegisterClick: () => void;
}

export const NavAuthActions: React.FC<NavAuthActionsProps> = ({ 
  handleLoginClick, 
  handleRegisterClick 
}) => {
  const { isAuthenticated, userType } = useAuth();

  // If user is authenticated, show logout and profile buttons
  if (isAuthenticated) {
    return (
      <div className="flex items-center gap-4">
        <a 
          href={userType === 'developer' ? '/profile' : '/client-profile'} 
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          My Profile
        </a>
        <LogoutButton variant="text" />
      </div>
    );
  }

  // If not authenticated, show login and register buttons
  return (
    <>
      <Button 
        variant="ghost" 
        className="button-ghost" 
        onClick={handleLoginClick}
      >
        Log In
      </Button>
      <Button 
        variant="default" 
        className="button-primary" 
        onClick={handleRegisterClick}
      >
        Sign Up
      </Button>
    </>
  );
};
