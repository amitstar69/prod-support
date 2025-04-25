
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/auth';
import { isRouteActive } from '../../../utils/navigationUtils';

interface NavLinksProps {
  isMobile?: boolean;
  onLinkClick?: () => void;
}

const NavLinks: React.FC<NavLinksProps> = ({ isMobile, onLinkClick }) => {
  const { isAuthenticated, userType } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;

  // For debugging
  console.log("Current path:", currentPath);
  
  // Developer-specific links
  const renderDeveloperLinks = () => {
    if (!isAuthenticated || userType !== 'developer') return null;
    
    return (
      <>
        <NavLink
          to="/developer/dashboard"
          className={
            isRouteActive('/developer/dashboard', currentPath)
              ? 'text-primary font-medium'
              : 'text-muted-foreground hover:text-foreground'
          }
          onClick={onLinkClick}
        >
          My Dashboard
        </NavLink>
        <NavLink
          to="/developer/tickets"
          className={
            isRouteActive('/developer/tickets', currentPath)
              ? 'text-primary font-medium'
              : 'text-muted-foreground hover:text-foreground'
          }
          onClick={onLinkClick}
        >
          Gigs
        </NavLink>
        <NavLink
          to="/developer/applications"
          className={
            isRouteActive('/developer/applications', currentPath)
              ? 'text-primary font-medium'
              : 'text-muted-foreground hover:text-foreground'
          }
          onClick={onLinkClick}
        >
          My Applications
        </NavLink>
        <NavLink
          to="/developer/profile"
          className={
            isRouteActive('/developer/profile', currentPath)
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
          className={
            isRouteActive('/client/dashboard', currentPath)
              ? 'text-primary font-medium'
              : 'text-muted-foreground hover:text-foreground'
          }
          onClick={onLinkClick}
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/client/tickets"
          className={
            isRouteActive('/client/tickets', currentPath)
              ? 'text-primary font-medium'
              : 'text-muted-foreground hover:text-foreground'
          }
          onClick={onLinkClick}
        >
          My Tickets
        </NavLink>
        <NavLink
          to="/client/profile"
          className={
            isRouteActive('/client/profile', currentPath)
              ? 'text-primary font-medium'
              : 'text-muted-foreground hover:text-foreground'
          }
          onClick={onLinkClick}
        >
          Profile
        </NavLink>
        <NavLink
          to="/get-help"
          className={
            isRouteActive('/get-help', currentPath)
              ? 'text-primary font-medium'
              : 'text-muted-foreground hover:text-foreground'
          }
          onClick={onLinkClick}
        >
          Get Help
        </NavLink>
        <NavLink
          to="/client/sessions"
          className={
            isRouteActive('/client/sessions', currentPath)
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
    <div className={`flex ${isMobile ? 'flex-col' : 'space-x-6'}`}>
      <NavLink
        to="/"
        className={
          currentPath === '/'
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
          className={
            isRouteActive('/search', currentPath)
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
