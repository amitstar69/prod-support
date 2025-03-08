
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, User, LogOut, Clock, MessageSquare } from 'lucide-react';
import { useAuth } from '../../contexts/auth';
import NavLinks from './NavLinks';
import { ServiceDropdown } from './ServiceDropdown';
import { NavAuthActions } from './NavAuthActions';
import LogoutButton from './LogoutButton';
import { toast } from 'sonner';

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
      <nav className="flex items-center space-x-4">
        <NavLinks />
        <ServiceDropdown />
        <Link to="#" className="px-3 py-2 rounded-md hover:bg-secondary transition-colors">
          How It Works
        </Link>
      </nav>

      {/* Right Side - Auth */}
      <div className="flex items-center space-x-4">
        {isAuthenticated ? (
          <>
            {userType === 'client' && (
              <button 
                className="button-primary flex items-center gap-2"
                onClick={() => {
                  navigate('/get-help');
                  setIsOpen(false);
                }}
              >
                <MessageSquare className="h-4 w-4" />
                <span>Get Instant Help</span>
              </button>
            )}
            <div className="relative group">
              <button className="button-secondary flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>My Account</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-background border border-border/40 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                <div className="py-1">
                  <button
                    onClick={handleProfileClick}
                    className="block w-full text-left px-4 py-2 hover:bg-secondary transition-colors"
                  >
                    {userType === 'developer' ? 'Developer Profile' : 'Client Profile'}
                  </button>
                  {userType === 'client' && (
                    <>
                      <Link 
                        to="/get-help/tracking" 
                        className="block w-full text-left px-4 py-2 hover:bg-secondary transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          Help Requests
                        </span>
                      </Link>
                      <Link to="/session-history" className="block w-full text-left px-4 py-2 hover:bg-secondary transition-colors">
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          Session History
                        </span>
                      </Link>
                    </>
                  )}
                  <LogoutButton 
                    variant="text" 
                    className="w-full text-left px-4 py-2 hover:bg-secondary transition-colors"
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
