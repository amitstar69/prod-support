
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Search, ChevronDown, LogIn, User, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, userType, logout } = useAuth();
  const navigate = useNavigate();
  
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  
  const handleLoginClick = () => {
    navigate('/login');
    setIsOpen(false);
  };
  
  const handleRegisterClick = () => {
    navigate('/register');
    setIsOpen(false);
  };
  
  const handleProfileClick = () => {
    navigate(userType === 'developer' ? '/profile' : '/client-profile');
    setIsOpen(false);
  };
  
  const handleLogoutClick = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  return (
    <header className="bg-background border-b border-border/40 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-xl font-bold">
              DevConnect
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            <Link to="/" className="px-3 py-2 rounded-md hover:bg-secondary transition-colors">
              Home
            </Link>
            <Link to="/search" className="px-3 py-2 rounded-md hover:bg-secondary transition-colors">
              Find Developers
            </Link>
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
            <Link to="#" className="px-3 py-2 rounded-md hover:bg-secondary transition-colors">
              How It Works
            </Link>
          </nav>

          {/* Right Side - Auth / Search */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="relative group">
                <button className="button-secondary flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>My Account</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-background border border-border/40 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                  <div className="py-1">
                    <button
                      onClick={handleProfileClick}
                      className="block w-full text-left px-4 py-2 hover:bg-secondary transition-colors"
                    >
                      {userType === 'developer' ? 'Developer Profile' : 'Client Profile'}
                    </button>
                    <button
                      onClick={handleLogoutClick}
                      className="block w-full text-left px-4 py-2 hover:bg-secondary transition-colors"
                    >
                      <span className="flex items-center">
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <button className="button-ghost" onClick={handleLoginClick}>
                  Log In
                </button>
                <button className="button-primary" onClick={handleRegisterClick}>
                  Sign Up
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              className="inline-flex items-center justify-center p-2 rounded-md hover:bg-secondary transition-colors"
              onClick={toggleMenu}
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden ${isOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link
            to="/"
            className="block px-3 py-2 rounded-md hover:bg-secondary transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/search"
            className="block px-3 py-2 rounded-md hover:bg-secondary transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Find Developers
          </Link>
          <Link
            to="#"
            className="block px-3 py-2 rounded-md hover:bg-secondary transition-colors"
            onClick={() => setIsOpen(false)}
          >
            How It Works
          </Link>
          
          <div className="pt-4 pb-3 border-t border-border/40">
            {isAuthenticated ? (
              <>
                <button
                  onClick={handleProfileClick}
                  className="flex items-center w-full px-3 py-2 rounded-md hover:bg-secondary transition-colors"
                >
                  <User className="h-5 w-5 mr-2" />
                  {userType === 'developer' ? 'Developer Profile' : 'Client Profile'}
                </button>
                <button
                  onClick={handleLogoutClick}
                  className="flex items-center w-full px-3 py-2 rounded-md hover:bg-secondary transition-colors"
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleLoginClick}
                  className="flex items-center w-full px-3 py-2 rounded-md hover:bg-secondary transition-colors"
                >
                  <LogIn className="h-5 w-5 mr-2" />
                  Log In
                </button>
                <button
                  onClick={handleRegisterClick}
                  className="w-full mt-2 button-primary"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
