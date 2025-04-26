
import React from 'react';
import { Button } from '@/components/ui/button';
import { Github, Chrome } from 'lucide-react';

export interface SocialLoginButtonsProps {
  onGoogleLogin?: () => void;
  onGithubLogin?: () => void;
  isLoading: boolean;
}

export const SocialLoginButtons: React.FC<SocialLoginButtonsProps> = ({
  onGoogleLogin,
  onGithubLogin,
  isLoading
}) => {
  return (
    <div className="w-full space-y-2">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t"></span>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <Button 
          variant="outline" 
          type="button" 
          onClick={onGoogleLogin}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <Chrome className="h-4 w-4" /> Google
        </Button>
        
        <Button 
          variant="outline" 
          type="button" 
          onClick={onGithubLogin}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <Github className="h-4 w-4" /> GitHub
        </Button>
      </div>
    </div>
  );
};
