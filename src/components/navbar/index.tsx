
import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { DesktopNav } from './DesktopNav';
import { MobileNav } from './MobileNav';
import { useIsMobile } from '../../hooks/use-mobile';
import { useAuth } from '../../contexts/auth';
import { getUserHomePage } from '../../utils/navigationUtils';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const isMobile = useIsMobile();
  const { userType, isAuthenticated } = useAuth();
  const location = useLocation();
  
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Logo link should navigate to user type specific home when logged in
  const logoLinkTarget = isAuthenticated ? getUserHomePage(userType) : '/';

  return (
    <header className="bg-background border-b border-border/40 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link 
              to={logoLinkTarget} 
              className="text-xl font-bold"
            >
              ProdSupport
            </Link>
          </div>

          {/* Desktop Navigation */}
          <DesktopNav />

          {/* Mobile menu button */}
          {isMobile && (
            <div className="md:hidden flex items-center">
              <button
                className="inline-flex items-center justify-center p-2 rounded-md hover:bg-secondary transition-colors"
                onClick={toggleMenu}
                aria-label={isOpen ? "Close menu" : "Open menu"}
              >
                {isOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      <MobileNav isOpen={isOpen} setIsOpen={setIsOpen} />
    </header>
  );
};

export default Navbar;
