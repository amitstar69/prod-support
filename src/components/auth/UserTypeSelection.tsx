
import React from 'react';
import { User, Code } from 'lucide-react';
import { UserType } from '../../hooks/useRegisterForm';

interface UserTypeSelectionProps {
  userType: UserType;
  onUserTypeChange: (type: UserType) => void;
}

const UserTypeSelection: React.FC<UserTypeSelectionProps> = ({ userType, onUserTypeChange }) => {
  return (
    <div className="space-y-4 mb-4">
      <h2 className="font-medium text-lg mb-2">I want to join as:</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
            userType === 'client' 
              ? 'border-primary bg-primary/5' 
              : 'border-border hover:border-primary/30'
          } h-[120px]`}
          onClick={() => onUserTypeChange('client')}
          aria-pressed={userType === 'client'}
          aria-label="Register as Client"
        >
          <User className={`h-8 w-8 mb-2 ${userType === 'client' ? 'text-primary' : ''}`} />
          <div className="text-center">
            <p className="font-medium">Client</p>
            <p className="text-xs text-muted-foreground mt-1">I need help from developers</p>
          </div>
        </button>
        
        <button
          type="button"
          className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
            userType === 'developer' 
              ? 'border-primary bg-primary/5' 
              : 'border-border hover:border-primary/30'
          } h-[120px]`}
          onClick={() => onUserTypeChange('developer')}
          aria-pressed={userType === 'developer'}
          aria-label="Register as Developer"
        >
          <Code className={`h-8 w-8 mb-2 ${userType === 'developer' ? 'text-primary' : ''}`} />
          <div className="text-center">
            <p className="font-medium">Developer</p>
            <p className="text-xs text-muted-foreground mt-1">I want to offer my services</p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default UserTypeSelection;
