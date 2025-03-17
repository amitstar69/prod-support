
import React from 'react';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';

interface AuthRequiredDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  actionType: 'view' | 'claim' | 'apply' | null;
  onLogin: () => void;
  onSignup: () => void;
}

const AuthRequiredDialog: React.FC<AuthRequiredDialogProps> = ({
  isOpen,
  onOpenChange,
  actionType,
  onLogin,
  onSignup
}) => {
  const getActionMessage = () => {
    switch(actionType) {
      case 'view':
        return 'You need to sign in to view this ticket\'s details.';
      case 'apply':
        return 'You need to sign in as a developer to apply for this ticket.';
      case 'claim':
        return 'You need to sign in as a developer to claim this ticket.';
      default:
        return 'You need to sign in to continue.';
    }
  };

  const getExplanationMessage = () => {
    switch(actionType) {
      case 'view':
        return 'Viewing ticket details requires an account to protect client privacy.';
      default:
        return 'Only registered developers can work on tickets.';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Authentication Required</DialogTitle>
          <DialogDescription>
            {getActionMessage()}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-4">
            Please sign in to your existing account or create a new developer account to continue.
          </p>
          <p className="text-sm text-muted-foreground">
            {getExplanationMessage()}
          </p>
        </div>
        <DialogFooter className="flex gap-2 sm:justify-start">
          <Button onClick={onLogin} className="flex-1 sm:flex-none">
            Sign In
          </Button>
          <Button onClick={onSignup} variant="outline" className="flex-1 sm:flex-none">
            Register
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AuthRequiredDialog;
