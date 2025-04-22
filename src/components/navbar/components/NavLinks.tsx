
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../../contexts/auth';

interface NavLinksProps {
  isMobile?: boolean;
  onLinkClick?: () => void;
}

const NavLinks: React.FC<NavLinksProps> = ({ isMobile, onLinkClick }) => {
  const { isAuthenticated, userType } = useAuth();

  // Developer-specific links
  const renderDeveloperLinks = () => {
    if (!isAuthenticated || userType !== 'developer') return null;
    
    return (
      <>
        <NavLink
          to="/developer/dashboard"
          className={({ isActive }) =>
            isActive
              ? 'text-primary font-medium'
              : 'text-muted-foreground hover:text-foreground'
          }
          onClick={onLinkClick}
        >
          My Dashboard
        </NavLink>
        <NavLink
          to="/developer/tickets"
          className={({ isActive }) =>
            isActive
              ? 'text-primary font-medium'
              : 'text-muted-foreground hover:text-foreground'
          }
          onClick={onLinkClick}
        >
          Gigs
        </NavLink>
        <NavLink
          to="/developer/applications"
          className={({ isActive }) =>
            isActive
              ? 'text-primary font-medium'
              : 'text-muted-foreground hover:text-foreground'
          }
          onClick={onLinkClick}
        >
          My Applications
        </NavLink>
        <NavLink
          to="/developer/profile"
          className={({ isActive }) =>
            isActive
              ? 'text-primary font-medium'
              : 'text-muted-foreground hover:text-foreground'
          }
          onClick={onLinkClick}
        >
          Profile
        </NavLink>
      </>
    );
  };
  
  // Client-specific links
  const renderClientLinks = () => {
    if (!isAuthenticated || userType !== 'client') return null;
    
    return (
      <>
        <NavLink
          to="/client/dashboard"
          className={({ isActive }) =>
            isActive
              ? 'text-primary font-medium'
              : 'text-muted-foreground hover:text-foreground'
          }
          onClick={onLinkClick}
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/client/tickets"
          className={({ isActive }) =>
            isActive
              ? 'text-primary font-medium'
              : 'text-muted-foreground hover:text-foreground'
          }
          onClick={onLinkClick}
        >
          My Tickets
        </NavLink>
        <NavLink
          to="/client/profile"
          className={({ isActive }) =>
            isActive
              ? 'text-primary font-medium'
              : 'text-muted-foreground hover:text-foreground'
          }
          onClick={onLinkClick}
        >
          Profile
        </NavLink>
        <NavLink
          to="/get-help"
          className={({ isActive }) =>
            isActive
              ? 'text-primary font-medium'
              : 'text-muted-foreground hover:text-foreground'
          }
          onClick={onLinkClick}
        >
          Get Help
        </NavLink>
        <NavLink
          to="/client/sessions"
          className={({ isActive }) =>
            isActive
              ? 'text-primary font-medium'
              : 'text-muted-foreground hover:text-foreground'
          }
          onClick={onLinkClick}
        >
          Session History
        </NavLink>
      </>
    );
  };

  return (
    <div className="flex space-x-6">
      <NavLink
        to="/"
        className={({ isActive }) =>
          isActive
            ? 'text-primary font-medium'
            : 'text-muted-foreground hover:text-foreground'
        }
        end
        onClick={onLinkClick}
      >
        Home
      </NavLink>

      {renderDeveloperLinks()}
      {renderClientLinks()}

      {/* Only show Find Developers for clients or non-authenticated users */}
      {(!isAuthenticated || userType === 'client') && (
        <NavLink
          to="/search"
          className={({ isActive }) =>
            isActive
              ? 'text-primary font-medium'
              : 'text-muted-foreground hover:text-foreground'
          }
          onClick={onLinkClick}
        >
          Find Developers
        </NavLink>
      )}
    </div>
  );
};

export default NavLinks;
