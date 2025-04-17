
import React from 'react';
import { Button } from '@/components/ui/button';
import { Github, Chrome } from 'lucide-react';
import { UserType } from '@/contexts/auth/types';

interface SocialRegisterButtonsProps {
  userType: UserType;
  onGoogleRegister: () => void;
  onGithubRegister: () => void;
  isLoading: boolean;
}

const SocialRegisterButtons: React.FC<SocialRegisterButtonsProps> = ({
  userType,
  onGoogleRegister,
  onGithubRegister,
  isLoading
}) => {
  return (
    <div className="flex flex-col space-y-2">
      <div className="relative my-3">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border/40"></span>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">Or register with</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          type="button"
          disabled={isLoading}
          onClick={onGoogleRegister}
          className="flex items-center justify-center gap-2"
        >
          <Chrome className="h-4 w-4" />
          Google
        </Button>
        
        <Button
          variant="outline"
          type="button"
          disabled={isLoading}
          onClick={onGithubRegister}
          className="flex items-center justify-center gap-2"
        >
          <Github className="h-4 w-4" />
          GitHub
        </Button>
      </div>
      
      <p className="text-center text-xs text-muted-foreground">
        Will register as {userType === 'client' ? 'Client' : 'Developer'}
      </p>
    </div>
  );
};

export default SocialRegisterButtons;
