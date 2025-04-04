
import React from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/auth';

const NavLinks: React.FC = () => {
  const { isAuthenticated, userType } = useAuth();

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

      {isAuthenticated && (
        <>
          {/* Client specific navigation */}
          {userType === 'client' && (
            <div className="group relative">
              <NavLink
                to="/search"
                className={({ isActive }) => `
                  flex items-center gap-1
                  ${isActive
                    ? 'text-primary font-medium' 
                    : 'text-muted-foreground hover:text-foreground'}
                `}
              >
                Find Talent <ChevronDown className="h-4 w-4" />
              </NavLink>

              <div className="absolute left-0 mt-1 w-56 rounded-md shadow-lg bg-background border border-border/40 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                <div className="py-1">
                  <NavLink
                    to="/search"
                    className={({ isActive }) => `
                      block px-4 py-2 text-sm
                      ${isActive ? 'bg-secondary/70 text-foreground' : 'hover:bg-secondary/70'}
                    `}
                  >
                    Browse Developers
                  </NavLink>
                  <NavLink
                    to="/get-help"
                    className={({ isActive }) => `
                      block px-4 py-2 text-sm
                      ${isActive ? 'bg-secondary/70 text-foreground' : 'hover:bg-secondary/70'}
                    `}
                  >
                    Get Instant Help
                  </NavLink>
                </div>
              </div>
            </div>
          )}

          {/* Developer specific navigation */}
          {userType === 'developer' && (
            <div className="group relative">
              <NavLink
                to="/developer-tickets"
                className={({ isActive }) => `
                  flex items-center gap-1
                  ${isActive
                    ? 'text-primary font-medium' 
                    : 'text-muted-foreground hover:text-foreground'}
                `}
              >
                Find Work <ChevronDown className="h-4 w-4" />
              </NavLink>

              <div className="absolute left-0 mt-1 w-56 rounded-md shadow-lg bg-background border border-border/40 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                <div className="py-1">
                  <NavLink
                    to="/developer-tickets"
                    className={({ isActive }) => `
                      block px-4 py-2 text-sm
                      ${isActive ? 'bg-secondary/70 text-foreground' : 'hover:bg-secondary/70'}
                    `}
                  >
                    Browse Available Gigs
                  </NavLink>
                  <NavLink
                    to="/my-applications"
                    className={({ isActive }) => `
                      block px-4 py-2 text-sm
                      ${isActive ? 'bg-secondary/70 text-foreground' : 'hover:bg-secondary/70'}
                    `}
                  >
                    My Applications
                  </NavLink>
                </div>
              </div>
            </div>
          )}

          {/* Dashboard links for both user types */}
          {userType === 'client' ? (
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
          ) : (
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
          )}

          {/* Profile links */}
          {userType === 'client' ? (
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
          ) : (
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
          )}

          {/* Session history for clients */}
          {userType === 'client' && (
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
          )}
        </>
      )}
    </div>
  );
};

export default NavLinks;
