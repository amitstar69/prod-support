
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, User } from 'lucide-react';
import { useAuth } from '../../contexts/auth';
import { NavAuthActions } from './NavAuthActions';
import LogoutButton from './LogoutButton';
import SearchBar from '../SearchBar';

interface DesktopNavProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const DesktopNav: React.FC<DesktopNavProps> = ({ isOpen, setIsOpen }) => {
  const { isAuthenticated, userType } = useAuth();
  const navigate = useNavigate();
  
  const handleLoginClick = () => {
    navigate('/login');
    setIsOpen(false);
  };
  
  const handleRegisterClick = () => {
    navigate('/register');
    setIsOpen(false);
  };
  
  const handleProfileClick = () => {
    navigate(userType === 'developer' ? '/profile' : '/client-profile');
    setIsOpen(false);
  };

  return (
    <div className="hidden md:flex items-center justify-between flex-1 ml-6">
      {/* Primary Navigation */}
      <nav className="flex items-center">
        <div className="flex space-x-1">
          {/* Find Developers Dropdown */}
          <div className="relative group">
            <button className="px-3 py-2 rounded-md hover:bg-secondary/70 transition-colors flex items-center">
              Find Help
              <ChevronDown className="h-4 w-4 ml-1 text-muted-foreground" />
            </button>
            <div className="absolute left-0 mt-1 w-48 rounded-md shadow-lg bg-background border border-border/40 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
              <div className="py-1">
                <Link
                  to="/search"
                  className="block px-4 py-2 text-sm hover:bg-secondary transition-colors"
                >
                  Search Developers
                </Link>
                <Link
                  to="/get-help"
                  className="block px-4 py-2 text-sm hover:bg-secondary transition-colors"
                >
                  Get Instant Help
                </Link>
              </div>
            </div>
          </div>
          
          {/* Show different navigation based on user type */}
          {userType === 'developer' ? (
            <Link 
              to="/developer-dashboard" 
              className="px-3 py-2 rounded-md hover:bg-secondary/70 transition-colors"
            >
              Browse Tickets
            </Link>
          ) : userType === 'client' ? (
            <Link 
              to="/client-dashboard" 
              className="px-3 py-2 rounded-md hover:bg-secondary/70 transition-colors"
            >
              My Requests
            </Link>
          ) : (
            <Link 
              to="/developer-dashboard" 
              className="px-3 py-2 rounded-md hover:bg-secondary/70 transition-colors"
            >
              Browse Tickets
            </Link>
          )}
          
          {/* Session History - only show if logged in */}
          {isAuthenticated && (
            <Link 
              to="/session-history" 
              className="px-3 py-2 rounded-md hover:bg-secondary/70 transition-colors"
            >
              Session History
            </Link>
          )}
        </div>
      </nav>

      {/* Right Side - Search and Auth */}
      <div className="flex items-center space-x-3">
        <SearchBar 
          className="w-64" 
          placeholder="Find developers..." 
        />
        
        {isAuthenticated ? (
          <>
            {/* User Account Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-2 p-2 rounded-md hover:bg-secondary/70 transition-colors">
                <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
              <div className="absolute right-0 mt-1 w-48 rounded-md shadow-lg bg-background border border-border/40 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                <div className="py-1">
                  <button
                    onClick={handleProfileClick}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-secondary transition-colors"
                  >
                    {userType === 'developer' ? 'Developer Profile' : 'Client Profile'}
                  </button>
                  
                  {userType === 'client' && (
                    <>
                      <Link 
                        to="/get-help/tracking" 
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-secondary transition-colors"
                      >
                        My Help Requests
                      </Link>
                    </>
                  )}
                  
                  <LogoutButton 
                    variant="text" 
                    className="w-full text-left px-4 py-2 text-sm hover:bg-secondary transition-colors"
                  />
                </div>
              </div>
            </div>
          </>
        ) : (
          <NavAuthActions 
            handleLoginClick={handleLoginClick} 
            handleRegisterClick={handleRegisterClick} 
          />
        )}
      </div>
    </div>
  );
};
