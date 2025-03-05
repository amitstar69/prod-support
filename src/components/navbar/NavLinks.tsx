
import React from 'react';
import { Link } from 'react-router-dom';

export const NavLinks: React.FC = () => {
  return (
    <>
      <Link to="/" className="px-3 py-2 rounded-md hover:bg-secondary transition-colors">
        Home
      </Link>
      <Link to="/search" className="px-3 py-2 rounded-md hover:bg-secondary transition-colors">
        Find Developers
      </Link>
    </>
  );
};
