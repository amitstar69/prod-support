
import React from 'react';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProfileLoadingStateProps {
  onForceLogout: () => void;
}

const ProfileLoadingState: React.FC<ProfileLoadingStateProps> = ({ onForceLogout }) => {
  return (
    <div className="container mx-auto px-4 py-12 text-center">
      <div className="animate-pulse text-xl mb-8">Loading profile...</div>
      
      <p className="text-muted-foreground mb-4">
        If this screen persists for more than a few seconds, you may want to log out and try again.
      </p>
      
      <Button 
        onClick={onForceLogout} 
        variant="outline"
        className="flex items-center gap-2"
      >
        <LogOut size={16} />
        <span>Force Logout</span>
      </Button>
    </div>
  );
};

export default ProfileLoadingState;
