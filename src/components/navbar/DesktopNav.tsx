
import React from 'react';
import { ThemeToggle } from '../ThemeToggle';
import NavLinks from './components/NavLinks';
import { AuthButtons } from './components/AuthButtons';
import NotificationsDropdown from '../notifications/NotificationsDropdown';
import { useAuth } from '../../contexts/auth';

export const DesktopNav: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="hidden md:flex items-center space-x-4">
      <NavLinks />
      <div className="flex items-center space-x-2">
        {isAuthenticated && <NotificationsDropdown />}
        <ThemeToggle />
        <AuthButtons />
      </div>
    </div>
  );
};
