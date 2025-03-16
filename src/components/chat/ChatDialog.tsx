
import React from 'react';
import ChatInterface from './ChatInterface';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { X } from 'lucide-react';
import { Button } from '../ui/button';

interface ChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
  helpRequestId: string;
  otherId: string;
  otherName?: string;
  otherAvatar?: string;
}

const ChatDialog: React.FC<ChatDialogProps> = ({
  isOpen,
  onClose,
  helpRequestId,
  otherId,
  otherName = 'User',
  otherAvatar
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg h-[80vh] flex flex-col">
        <DialogHeader className="flex justify-between items-center flex-row">
          <DialogTitle>Chat with {otherName}</DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          <ChatInterface 
            helpRequestId={helpRequestId}
            otherId={otherId}
            otherName={otherName}
            otherAvatar={otherAvatar}
            onClose={onClose}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChatDialog;
