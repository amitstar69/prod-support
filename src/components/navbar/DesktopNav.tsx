
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/auth';
import { Button } from '../ui/button';
import { ThemeToggle } from '../ThemeToggle';
import { getUserHomePage } from '../../utils/navigationUtils';

interface DesktopNavProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const DesktopNav: React.FC<DesktopNavProps> = () => {
  const { isAuthenticated, userType, logout } = useAuth();
  const location = useLocation();
  
  const handleLogout = async () => {
    await logout();
  };
  
  // Get the user's home page based on user type
  const homePath = getUserHomePage(userType);
  
  return (
    <div className="hidden md:flex items-center space-x-4">
      {/* Navigation Links */}
      <div className="flex items-center space-x-2">
        {/* Show public links for all users */}
        <Link
          to="/"
          className={`px-3 py-2 rounded-md text-sm font-medium 
            ${location.pathname === '/' ? 'text-primary' : 'hover:text-primary transition-colors'}`}
        >
          Home
        </Link>
        
        <Link
          to="/search"
          className={`px-3 py-2 rounded-md text-sm font-medium 
            ${location.pathname === '/search' ? 'text-primary' : 'hover:text-primary transition-colors'}`}
        >
          Find Developers
        </Link>
        
        {/* Authenticated user links based on user type */}
        {isAuthenticated && userType === 'developer' && (
          <>
            <Link
              to="/developer"
              className={`px-3 py-2 rounded-md text-sm font-medium 
                ${location.pathname === '/developer' ? 'text-primary' : 'hover:text-primary transition-colors'}`}
            >
              Dashboard
            </Link>
            <Link
              to="/developer/tickets"
              className={`px-3 py-2 rounded-md text-sm font-medium 
                ${location.pathname.includes('/developer/tickets') ? 'text-primary' : 'hover:text-primary transition-colors'}`}
            >
              Gigs
            </Link>
            <Link
              to="/developer/applications"
              className={`px-3 py-2 rounded-md text-sm font-medium 
                ${location.pathname.includes('/developer/applications') ? 'text-primary' : 'hover:text-primary transition-colors'}`}
            >
              Applications
            </Link>
            <Link
              to="/developer/profile"
              className={`px-3 py-2 rounded-md text-sm font-medium 
                ${location.pathname.includes('/developer/profile') ? 'text-primary' : 'hover:text-primary transition-colors'}`}
            >
              Profile
            </Link>
          </>
        )}
        
        {isAuthenticated && userType === 'client' && (
          <>
            <Link
              to="/client"
              className={`px-3 py-2 rounded-md text-sm font-medium 
                ${location.pathname === '/client' ? 'text-primary' : 'hover:text-primary transition-colors'}`}
            >
              Dashboard
            </Link>
            <Link
              to="/client/tickets"
              className={`px-3 py-2 rounded-md text-sm font-medium 
                ${location.pathname.includes('/client/tickets') ? 'text-primary' : 'hover:text-primary transition-colors'}`}
            >
              Tickets
            </Link>
            <Link
              to="/client/profile"
              className={`px-3 py-2 rounded-md text-sm font-medium 
                ${location.pathname.includes('/client/profile') ? 'text-primary' : 'hover:text-primary transition-colors'}`}
            >
              Profile
            </Link>
            <Link
              to="/client/help"
              className={`px-3 py-2 rounded-md text-sm font-medium 
                ${location.pathname.includes('/client/help') ? 'text-primary' : 'hover:text-primary transition-colors'}`}
            >
              Get Help
            </Link>
            <Link
              to="/client/sessions"
              className={`px-3 py-2 rounded-md text-sm font-medium 
                ${location.pathname.includes('/client/sessions') ? 'text-primary' : 'hover:text-primary transition-colors'}`}
            >
              Session History
            </Link>
          </>
        )}
      </div>
      
      {/* Auth/User buttons */}
      <div className="flex items-center space-x-2">
        <ThemeToggle />
        
        {isAuthenticated ? (
          <div className="flex items-center space-x-2">
            <Button variant="ghost" onClick={handleLogout}>
              Logout
            </Button>
            <Button asChild>
              <Link to={homePath}>
                {userType === 'developer' ? 'My Dashboard' : 'My Account'}
              </Link>
            </Button>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <Button variant="ghost" asChild>
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link to="/register">Sign Up</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
