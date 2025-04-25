
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/auth';

interface NavLinksProps {
  isMobile?: boolean;
  onLinkClick?: () => void;
}

const NavLinks: React.FC<NavLinksProps> = ({ isMobile, onLinkClick }) => {
  const { isAuthenticated, userType } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;

  // Check if a route should be marked active based on current path
  const isRouteActive = (path: string): boolean => {
    // Handle root paths for each user type
    if (path === '/developer' && (currentPath === '/developer' || currentPath === '/developer/dashboard')) {
      return true;
    }
    if (path === '/client/dashboard' && currentPath === '/client') {
      return true;
    }
    // Handle exact matches
    if (path === currentPath) {
      return true;
    }
    // Handle section matches (e.g. /developer/tickets/123 should highlight /developer/tickets)
    if (path !== '/' && currentPath.startsWith(path)) {
      // Make sure it's a section match (e.g. /developer/tickets should match /developer/tickets/123)
      // but /developer should not match /developer/tickets
      const nextChar = currentPath.substring(path.length, path.length + 1);
      return nextChar === '' || nextChar === '/';
    }
    return false;
  };

  // Developer-specific links
  const renderDeveloperLinks = () => {
    if (!isAuthenticated || userType !== 'developer') return null;
    
    return (
      <>
        <NavLink
          to="/developer/dashboard"
          className={({ isActive }) =>
            isRouteActive('/developer/dashboard') || isRouteActive('/developer')
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
            isRouteActive('/developer/tickets')
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
            isRouteActive('/developer/applications')
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
            isRouteActive('/developer/profile')
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
            isRouteActive('/client/dashboard') || isRouteActive('/client')
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
            isRouteActive('/client/tickets')
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
            isRouteActive('/client/profile')
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
            isRouteActive('/get-help')
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
            isRouteActive('/client/sessions')
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
          isRouteActive('/') && currentPath === '/'
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
            isRouteActive('/search')
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
