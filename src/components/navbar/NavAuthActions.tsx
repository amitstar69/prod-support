
import React from 'react';
import { Button } from '@/components/ui/button';

interface NavAuthActionsProps {
  handleLoginClick: () => void;
  handleRegisterClick: () => void;
}

export const NavAuthActions: React.FC<NavAuthActionsProps> = ({ 
  handleLoginClick, 
  handleRegisterClick 
}) => {
  return (
    <div className="flex items-center gap-2">
      <Button 
        variant="outline" 
        className="border-border h-9 px-4 py-2 text-sm"
        onClick={handleLoginClick}
      >
        Log In
      </Button>
      <Button 
        variant="default" 
        className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 text-sm"
        onClick={handleRegisterClick}
      >
        Sign Up
      </Button>
    </div>
  );
};
