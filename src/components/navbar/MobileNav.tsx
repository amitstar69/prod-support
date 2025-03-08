
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogIn, Clock, MessageSquare } from 'lucide-react';
import { useAuth } from '../../contexts/auth';
import LogoutButton from './LogoutButton';

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
    <div className="md:hidden">
      <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
        <Link
          to="/"
          className="block px-3 py-2 rounded-md hover:bg-secondary transition-colors"
          onClick={() => setIsOpen(false)}
        >
          Home
        </Link>
        <Link
          to="/search"
          className="block px-3 py-2 rounded-md hover:bg-secondary transition-colors"
          onClick={() => setIsOpen(false)}
        >
          Find Developers
        </Link>
        <Link
          to="#"
          className="block px-3 py-2 rounded-md hover:bg-secondary transition-colors"
          onClick={() => setIsOpen(false)}
        >
          How It Works
        </Link>
        
        <div className="pt-4 pb-3 border-t border-border/40">
          {isAuthenticated ? (
            <>
              {userType === 'client' && (
                <button
                  className="flex items-center w-full px-3 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  onClick={() => {
                    navigate('/get-help');
                    setIsOpen(false);
                  }}
                >
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Get Instant Help
                </button>
              )}
              <button
                onClick={handleProfileClick}
                className="flex items-center w-full px-3 py-2 rounded-md hover:bg-secondary transition-colors mt-2"
              >
                <User className="h-5 w-5 mr-2" />
                {userType === 'developer' ? 'Developer Profile' : 'Client Profile'}
              </button>
              {userType === 'client' && (
                <>
                  <Link
                    to="/get-help/tracking"
                    className="flex items-center w-full px-3 py-2 rounded-md hover:bg-secondary transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <Clock className="h-5 w-5 mr-2" />
                    Help Requests
                  </Link>
                  <Link
                    to="/session-history"
                    className="flex items-center w-full px-3 py-2 rounded-md hover:bg-secondary transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <Clock className="h-5 w-5 mr-2" />
                    Session History
                  </Link>
                </>
              )}
              <LogoutButton 
                variant="text" 
                className="flex items-center w-full px-3 py-2 rounded-md hover:bg-secondary transition-colors"
              />
            </>
          ) : (
            <>
              <button
                onClick={handleLoginClick}
                className="flex items-center w-full px-3 py-2 rounded-md hover:bg-secondary transition-colors"
              >
                <LogIn className="h-5 w-5 mr-2" />
                Log In
              </button>
              <button
                onClick={handleRegisterClick}
                className="w-full mt-2 button-primary"
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
