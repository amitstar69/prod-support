
import React from 'react';
import { Menu, X } from 'lucide-react';
import { DesktopNav } from './DesktopNav';
import { MobileNav } from './MobileNav';
import { useIsMobile } from '../../hooks/use-mobile';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const isMobile = useIsMobile();
  
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <header className="bg-background border-b border-border/40 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo - kept in both mobile and desktop views */}
          <div className="flex-shrink-0">
            <a href="/" className="text-xl font-bold">
              DevConnect
            </a>
          </div>

          {/* Desktop Navigation */}
          <DesktopNav isOpen={isOpen} setIsOpen={setIsOpen} />

          {/* Mobile menu button */}
          {isMobile && (
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
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      <MobileNav isOpen={isOpen} setIsOpen={setIsOpen} />
    </header>
  );
};

export default Navbar;
