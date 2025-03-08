
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/auth';

const NavLinks: React.FC = () => {
  const { userType } = useAuth();
  const isDeveloper = userType === 'developer';

  return (
    <div className="hidden md:flex items-center space-x-6">
      <Link to="/" className="text-foreground hover:text-primary transition-colors">
        Home
      </Link>
      
      <Link to="/search" className="text-foreground hover:text-primary transition-colors">
        Find Developers
      </Link>
      
      <Link to="/get-help" className="text-foreground hover:text-primary transition-colors">
        Get Help
      </Link>
      
      {isDeveloper && (
        <Link to="/developer-dashboard" className="text-foreground hover:text-primary transition-colors">
          Ticket Dashboard
        </Link>
      )}
      
      <Link to="/session-history" className="text-foreground hover:text-primary transition-colors">
        Session History
      </Link>
    </div>
  );
};

export default NavLinks;
