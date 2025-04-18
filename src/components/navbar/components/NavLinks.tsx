
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/auth';

interface NavLinkProps {
  to: string;
  onClick?: () => void;
  children: React.ReactNode;
  isMobile?: boolean;
}

const NavLink = ({ to, onClick, children, isMobile = false }: NavLinkProps) => {
  const location = useLocation();
  const isActive = location.pathname === to || location.pathname.startsWith(`${to}/`);
  
  const baseClasses = isMobile
    ? 'block px-3 py-2 rounded-md text-base font-medium'
    : 'px-3 py-2 rounded-md text-sm font-medium';
    
  const activeClasses = isMobile
    ? 'bg-primary/10 text-primary'
    : 'text-primary';
    
  const inactiveClasses = 'hover:text-primary transition-colors';
  
  return (
    <Link
      to={to}
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
      onClick={onClick}
    >
      {children}
    </Link>
  );
};

export const NavLinks = ({ isMobile = false, onLinkClick }: { isMobile?: boolean, onLinkClick?: () => void }) => {
  const { isAuthenticated, userType } = useAuth();

  const renderDeveloperLinks = () => {
    if (!isAuthenticated || userType !== 'developer') return null;
    
    return (
      <>
        <NavLink to="/developer" onClick={onLinkClick} isMobile={isMobile}>
          Dashboard
        </NavLink>
        <NavLink to="/developer/tickets" onClick={onLinkClick} isMobile={isMobile}>
          Gigs
        </NavLink>
        <NavLink to="/developer/applications" onClick={onLinkClick} isMobile={isMobile}>
          Applications
        </NavLink>
        <NavLink to="/developer/profile" onClick={onLinkClick} isMobile={isMobile}>
          Profile
        </NavLink>
      </>
    );
  };

  const renderClientLinks = () => {
    if (!isAuthenticated || userType !== 'client') return null;
    
    return (
      <>
        <NavLink to="/client" onClick={onLinkClick} isMobile={isMobile}>
          Dashboard
        </NavLink>
        <NavLink to="/client/tickets" onClick={onLinkClick} isMobile={isMobile}>
          Tickets
        </NavLink>
        <NavLink to="/client/profile" onClick={onLinkClick} isMobile={isMobile}>
          Profile
        </NavLink>
        <NavLink to="/client/help" onClick={onLinkClick} isMobile={isMobile}>
          Get Help
        </NavLink>
        <NavLink to="/client/sessions" onClick={onLinkClick} isMobile={isMobile}>
          Session History
        </NavLink>
      </>
    );
  };

  return (
    <div className={isMobile ? "space-y-1" : "flex items-center space-x-2"}>
      <NavLink to="/" onClick={onLinkClick} isMobile={isMobile}>
        Home
      </NavLink>
      
      {(!isAuthenticated || userType === 'client') && (
        <NavLink to="/search" onClick={onLinkClick} isMobile={isMobile}>
          Find Developers
        </NavLink>
      )}
      
      {renderDeveloperLinks()}
      {renderClientLinks()}
    </div>
  );
};
