
import React from 'react';

interface NavAuthActionsProps {
  handleLoginClick: () => void;
  handleRegisterClick: () => void;
}

export const NavAuthActions: React.FC<NavAuthActionsProps> = ({ 
  handleLoginClick, 
  handleRegisterClick 
}) => {
  return (
    <>
      <button className="button-ghost" onClick={handleLoginClick}>
        Log In
      </button>
      <button className="button-primary" onClick={handleRegisterClick}>
        Sign Up
      </button>
    </>
  );
};
