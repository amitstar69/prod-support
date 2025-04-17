
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/auth';
import { ThemeToggle } from '../ThemeToggle';
import { Button } from '../ui/button';
import { getUserHomePage } from '../../utils/navigationUtils';

interface MobileNavProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const MobileNav: React.FC<MobileNavProps> = ({ isOpen, setIsOpen }) => {
  const { isAuthenticated, userType, logout } = useAuth();
  const location = useLocation();
  
  const homePath = getUserHomePage(userType);
  
  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
  };
  
  const handleLinkClick = () => {
    setIsOpen(false);
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="md:hidden">
      <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-border/40">
        {/* Mobile Navigation Links */}
        <Link
          to="/"
          className={`block px-3 py-2 rounded-md text-base font-medium ${
            location.pathname === '/' ? 'bg-primary/10 text-primary' : 'hover:bg-secondary'
          }`}
          onClick={handleLinkClick}
        >
          Home
        </Link>
        
        <Link
          to="/search"
          className={`block px-3 py-2 rounded-md text-base font-medium ${
            location.pathname === '/search' ? 'bg-primary/10 text-primary' : 'hover:bg-secondary'
          }`}
          onClick={handleLinkClick}
        >
          Find Developers
        </Link>
        
        {/* Authenticated user links based on user type */}
        {isAuthenticated && userType === 'developer' && (
          <>
            <Link
              to="/developer"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                location.pathname === '/developer' ? 'bg-primary/10 text-primary' : 'hover:bg-secondary'
              }`}
              onClick={handleLinkClick}
            >
              Dashboard
            </Link>
            <Link
              to="/developer/tickets"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                location.pathname.includes('/developer/tickets') ? 'bg-primary/10 text-primary' : 'hover:bg-secondary'
              }`}
              onClick={handleLinkClick}
            >
              Gigs
            </Link>
            <Link
              to="/developer/applications"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                location.pathname.includes('/developer/applications') ? 'bg-primary/10 text-primary' : 'hover:bg-secondary'
              }`}
              onClick={handleLinkClick}
            >
              Applications
            </Link>
            <Link
              to="/developer/profile"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                location.pathname.includes('/developer/profile') ? 'bg-primary/10 text-primary' : 'hover:bg-secondary'
              }`}
              onClick={handleLinkClick}
            >
              Profile
            </Link>
            <Link
              to="/developer/sessions"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                location.pathname.includes('/developer/sessions') ? 'bg-primary/10 text-primary' : 'hover:bg-secondary'
              }`}
              onClick={handleLinkClick}
            >
              Sessions
            </Link>
          </>
        )}
        
        {isAuthenticated && userType === 'client' && (
          <>
            <Link
              to="/client"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                location.pathname === '/client' ? 'bg-primary/10 text-primary' : 'hover:bg-secondary'
              }`}
              onClick={handleLinkClick}
            >
              Dashboard
            </Link>
            <Link
              to="/client/tickets"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                location.pathname.includes('/client/tickets') ? 'bg-primary/10 text-primary' : 'hover:bg-secondary'
              }`}
              onClick={handleLinkClick}
            >
              Tickets
            </Link>
            <Link
              to="/client/profile"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                location.pathname.includes('/client/profile') ? 'bg-primary/10 text-primary' : 'hover:bg-secondary'
              }`}
              onClick={handleLinkClick}
            >
              Profile
            </Link>
            <Link
              to="/client/help"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                location.pathname.includes('/client/help') ? 'bg-primary/10 text-primary' : 'hover:bg-secondary'
              }`}
              onClick={handleLinkClick}
            >
              Get Help
            </Link>
            <Link
              to="/client/sessions"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                location.pathname.includes('/client/sessions') ? 'bg-primary/10 text-primary' : 'hover:bg-secondary'
              }`}
              onClick={handleLinkClick}
            >
              Session History
            </Link>
          </>
        )}
        
        {/* Auth buttons */}
        <div className="pt-4 pb-3 border-t border-border/40">
          <div className="flex items-center px-5">
            <div className="ml-auto">
              <ThemeToggle />
            </div>
          </div>
          <div className="mt-3 px-2 space-y-1">
            {isAuthenticated ? (
              <>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
                <Button
                  className="w-full justify-start"
                  asChild
                  onClick={handleLinkClick}
                >
                  <Link to={homePath}>
                    {userType === 'developer' ? 'My Dashboard' : 'My Account'}
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  asChild
                  onClick={handleLinkClick}
                >
                  <Link to="/login">Login</Link>
                </Button>
                <Button
                  className="w-full justify-start"
                  asChild
                  onClick={handleLinkClick}
                >
                  <Link to="/register">Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
