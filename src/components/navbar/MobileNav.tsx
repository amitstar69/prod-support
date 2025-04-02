
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogIn, Search } from 'lucide-react';
import { useAuth } from '../../contexts/auth';
import LogoutButton from './LogoutButton';
import SearchBar from '../SearchBar';

interface MobileNavProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ isOpen, setIsOpen }) => {
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

  if (!isOpen) return null;

  return (
    <div className="md:hidden border-t border-border/40">
      <div className="p-3">
        {/* Only show search for client or non-authenticated users */}
        {(!isAuthenticated || userType === 'client') && (
          <SearchBar
            placeholder="Find developers..."
            className="mb-4"
          />
        )}
        
        <div className="space-y-1">
          {/* Show different sections based on user type */}
          {userType === 'developer' ? (
            // Developer navigation section
            <>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-2">
                Developer Menu
              </p>
              
              <Link
                to="/developer-dashboard"
                className="block px-3 py-2 text-sm rounded-md hover:bg-secondary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                My Dashboard
              </Link>
              <Link
                to="/developer-tickets"
                className="block px-3 py-2 text-sm rounded-md hover:bg-secondary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Gigs
              </Link>
            </>
          ) : (
            // Client navigation section or non-authenticated
            <>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-2">
                Find Help
              </p>
              
              <Link
                to="/search"
                className="block px-3 py-2 text-sm rounded-md hover:bg-secondary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Search Developers
              </Link>
              
              {/* Only show Get Help for clients */}
              {isAuthenticated && userType === 'client' && (
                <Link
                  to="/get-help"
                  className="block px-3 py-2 text-sm rounded-md hover:bg-secondary transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Get Instant Help
                </Link>
              )}
              
              {userType === 'client' && (
                <>
                  <Link
                    to="/client-dashboard"
                    className="block px-3 py-2 text-sm rounded-md hover:bg-secondary transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/client-tickets"
                    className="block px-3 py-2 text-sm rounded-md hover:bg-secondary transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Tickets
                  </Link>
                </>
              )}
            </>
          )}
          
          {/* Session History - only show for clients, not developers */}
          {isAuthenticated && userType === 'client' && (
            <Link
              to="/session-history"
              className="block px-3 py-2 text-sm rounded-md hover:bg-secondary transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Session History
            </Link>
          )}
        </div>
        
        <div className="my-4 border-t border-border/40 pt-4">
          {isAuthenticated ? (
            <>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-2">
                My Account
              </p>
              
              <button
                onClick={handleProfileClick}
                className="flex items-center w-full px-3 py-2 text-sm rounded-md hover:bg-secondary transition-colors"
              >
                <User className="h-4 w-4 mr-2" />
                {userType === 'developer' ? 'Developer Profile' : 'Client Profile'}
              </button>
              
              {userType === 'client' && (
                <Link
                  to="/get-help/tracking"
                  className="block px-3 py-2 text-sm rounded-md hover:bg-secondary transition-colors ml-6"
                  onClick={() => setIsOpen(false)}
                >
                  My Help Requests
                </Link>
              )}
              
              <LogoutButton 
                variant="text" 
                className="flex items-center w-full px-3 py-2 text-sm rounded-md hover:bg-secondary transition-colors"
              />
            </>
          ) : (
            <div className="flex flex-col space-y-2">
              <button
                onClick={handleLoginClick}
                className="flex items-center w-full px-3 py-2 rounded-md border border-border hover:bg-secondary transition-colors"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Log In
              </button>
              
              <button
                onClick={handleRegisterClick}
                className="w-full px-3 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
