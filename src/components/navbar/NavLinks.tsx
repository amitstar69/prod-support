
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/auth';

const NavLinks: React.FC = () => {
  const { isAuthenticated, userType } = useAuth();

  // Developer-specific links
  const renderDeveloperLinks = () => {
    if (!isAuthenticated || userType !== 'developer') return null;
    
    return (
      <>
        <NavLink
          to="/developer-dashboard"
          className={({ isActive }) =>
            isActive
              ? 'text-primary font-medium'
              : 'text-muted-foreground hover:text-foreground'
          }
        >
          My Dashboard
        </NavLink>
        <NavLink
          to="/developer-tickets"
          className={({ isActive }) =>
            isActive
              ? 'text-primary font-medium'
              : 'text-muted-foreground hover:text-foreground'
          }
        >
          Gigs
        </NavLink>
        <NavLink
          to="/my-applications"
          className={({ isActive }) =>
            isActive
              ? 'text-primary font-medium'
              : 'text-muted-foreground hover:text-foreground'
          }
        >
          My Applications
        </NavLink>
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            isActive
              ? 'text-primary font-medium'
              : 'text-muted-foreground hover:text-foreground'
          }
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
          to="/client-dashboard"
          className={({ isActive }) =>
            isActive
              ? 'text-primary font-medium'
              : 'text-muted-foreground hover:text-foreground'
          }
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/client-tickets"
          className={({ isActive }) =>
            isActive
              ? 'text-primary font-medium'
              : 'text-muted-foreground hover:text-foreground'
          }
        >
          Tickets
        </NavLink>
        <NavLink
          to="/client-profile"
          className={({ isActive }) =>
            isActive
              ? 'text-primary font-medium'
              : 'text-muted-foreground hover:text-foreground'
          }
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
        >
          Get Help
        </NavLink>
        <NavLink
          to="/session-history"
          className={({ isActive }) =>
            isActive
              ? 'text-primary font-medium'
              : 'text-muted-foreground hover:text-foreground'
          }
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
        >
          Find Developers
        </NavLink>
      )}
    </div>
  );
};

export default NavLinks;
