
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Alert, AlertDescription } from '../ui/alert';
import { CheckCircle2, MessageCircle } from 'lucide-react';

interface ApprovalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  approvedApplication: any | null;
  onStartChat: (developerId: string, applicationId: string) => void;
  getDeveloperName: (application: any) => string;
  getDeveloperImage: (application: any) => string;
}

const ApprovalDialog: React.FC<ApprovalDialogProps> = ({
  open,
  onOpenChange,
  approvedApplication,
  onStartChat,
  getDeveloperName,
  getDeveloperImage
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <CheckCircle2 className="h-5 w-5 text-green-600 mr-2" />
            Application Approved!
          </DialogTitle>
          <DialogDescription>
            You've approved a developer to work on your request.
          </DialogDescription>
        </DialogHeader>
        
        {approvedApplication && (
          <div className="space-y-4 my-4">
            <div className="flex items-center gap-3 mb-2">
              <Avatar className="h-12 w-12 border border-border">
                <AvatarImage src={getDeveloperImage(approvedApplication)} alt={getDeveloperName(approvedApplication)} />
                <AvatarFallback>{getDeveloperName(approvedApplication).charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-medium">{getDeveloperName(approvedApplication)}</h4>
                <p className="text-sm text-muted-foreground">Ready to help with your request</p>
              </div>
            </div>
            
            <Alert className="bg-blue-50 border-blue-200 text-blue-800">
              <AlertDescription>
                Start chatting with {getDeveloperName(approvedApplication)} to discuss your request and get started.
              </AlertDescription>
            </Alert>
          </div>
        )}
        
        <DialogFooter className="flex sm:justify-between gap-3">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          <Button 
            className="flex gap-2"
            onClick={() => approvedApplication && onStartChat(approvedApplication.developer_id, approvedApplication.id)}
          >
            <MessageCircle className="h-4 w-4" />
            Start Chatting
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApprovalDialog;
