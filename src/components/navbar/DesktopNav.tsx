
import React from 'react';
import { ThemeToggle } from '../ThemeToggle';
import { NavLinks } from './components/NavLinks';
import { AuthButtons } from './components/AuthButtons';

export const DesktopNav: React.FC = () => {
  return (
    <div className="hidden md:flex items-center space-x-4">
      <NavLinks />
      <div className="flex items-center space-x-2">
        <ThemeToggle />
        <AuthButtons />
      </div>
    </div>
  );
};
