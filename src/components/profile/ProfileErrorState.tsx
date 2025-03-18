
import React from 'react';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProfileErrorStateProps {
  title: string;
  message: string;
  onForceLogout: () => void;
  onRetry?: () => void;
}

const ProfileErrorState: React.FC<ProfileErrorStateProps> = ({ 
  title, 
  message, 
  onForceLogout, 
  onRetry 
}) => {
  return (
    <div className="container mx-auto px-4 py-12 text-center">
      <h2 className="heading-3 mb-4">{title}</h2>
      <p className="text-muted-foreground mb-6">{message}</p>
      
      <div className="flex flex-col items-center gap-4">
        {onRetry && (
          <Button 
            onClick={onRetry}
            variant="default"
            className="w-48"
          >
            Try Again
          </Button>
        )}
        
        <Button 
          onClick={onForceLogout}
          variant="outline"
          className="w-48 flex items-center justify-center gap-2"
        >
          <LogOut size={16} />
          <span>Log Out</span>
        </Button>
      </div>
    </div>
  );
};

export default ProfileErrorState;
