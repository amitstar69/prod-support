
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/auth';
import NotificationsDropdown from '../notifications/NotificationsDropdown';

interface NavLinksProps {
  className?: string;
  onClick?: () => void;
}

const NavLinks: React.FC<NavLinksProps> = ({ className = '', onClick }) => {
  const { isAuthenticated, userType } = useAuth();

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <NavLink 
        to="/search"
        onClick={onClick}
        className={({ isActive }) => 
          `px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            isActive ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
          }`
        }
      >
        Search
      </NavLink>
      
      {/* Always show Get Help */}
      <NavLink 
        to="/get-help"
        onClick={onClick}
        className={({ isActive }) => 
          `px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            isActive ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
          }`
        }
      >
        Get Help
      </NavLink>
      
      {/* Conditional Dashboard links based on user type */}
      {isAuthenticated && userType === 'client' && (
        <NavLink 
          to="/client-dashboard"
          onClick={onClick}
          className={({ isActive }) => 
            `px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
            }`
          }
        >
          My Requests
        </NavLink>
      )}
      
      {isAuthenticated && userType === 'developer' && (
        <NavLink 
          to="/developer-dashboard"
          onClick={onClick}
          className={({ isActive }) => 
            `px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
            }`
          }
        >
          Find Work
        </NavLink>
      )}
      
      {isAuthenticated && (
        <NavLink 
          to="/session-history"
          onClick={onClick}
          className={({ isActive }) => 
            `px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
            }`
          }
        >
          Sessions
        </NavLink>
      )}
      
      {/* Notifications Dropdown for authenticated users */}
      {isAuthenticated && (
        <NotificationsDropdown />
      )}
    </div>
  );
};

export default NavLinks;
