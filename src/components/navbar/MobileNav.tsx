
import React from 'react';
import { ThemeToggle } from '../ThemeToggle';
import { NavLinks } from './components/NavLinks';
import { AuthButtons } from './components/AuthButtons';

interface MobileNavProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const MobileNav: React.FC<MobileNavProps> = ({ isOpen, setIsOpen }) => {
  if (!isOpen) return null;

  const handleAction = () => {
    setIsOpen(false);
  };

  return (
    <div className="md:hidden">
      <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-border/40">
        <NavLinks isMobile onLinkClick={handleAction} />
        
        <div className="pt-4 pb-3 border-t border-border/40">
          <div className="flex items-center px-5">
            <div className="ml-auto">
              <ThemeToggle />
            </div>
          </div>
          
          <div className="mt-3 px-2 space-y-1">
            <AuthButtons isMobile onAction={handleAction} />
          </div>
        </div>
      </div>
    </div>
  );
};
