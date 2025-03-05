
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

export const ServiceDropdown: React.FC = () => {
  return (
    <div className="relative group">
      <button className="px-3 py-2 rounded-md hover:bg-secondary transition-colors flex items-center">
        Services
        <ChevronDown className="h-4 w-4 ml-1" />
      </button>
      <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-background border border-border/40 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
        <div className="py-1">
          <Link
            to="/search?category=frontend"
            className="block px-4 py-2 hover:bg-secondary transition-colors"
          >
            Frontend Development
          </Link>
          <Link
            to="/search?category=backend"
            className="block px-4 py-2 hover:bg-secondary transition-colors"
          >
            Backend Development
          </Link>
          <Link
            to="/search?category=fullstack"
            className="block px-4 py-2 hover:bg-secondary transition-colors"
          >
            Full Stack Development
          </Link>
          <Link
            to="/search?category=mobile"
            className="block px-4 py-2 hover:bg-secondary transition-colors"
          >
            Mobile Development
          </Link>
        </div>
      </div>
    </div>
  );
};
