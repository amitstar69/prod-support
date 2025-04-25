
import React, { useState } from 'react';
import { toast } from 'sonner';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Loader2, AlertTriangle } from 'lucide-react';
import { updateHelpRequest } from '../../integrations/supabase/helpRequests';
import { useAuth } from '../../contexts/auth';

interface CancelHelpRequestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: string;
  requestTitle: string;
  onRequestCancelled: () => void;
}

const CancelHelpRequestDialog: React.FC<CancelHelpRequestDialogProps> = ({
  isOpen,
  onClose,
  requestId,
  requestTitle,
  onRequestCancelled
}) => {
  const [cancellationReason, setCancellationReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { userType } = useAuth();

  const handleCancellation = async () => {
    if (!requestId) return;
    
    if (!cancellationReason.trim()) {
      toast.error('Please provide a reason for cancellation');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Use the correct status value that matches the database constraint
      const response = await updateHelpRequest(requestId, {
        status: 'cancelled_by_client',
        cancellation_reason: cancellationReason
      }, userType || 'client');
      
      if (response.success) {
        toast.success('Help request cancelled successfully');
        onRequestCancelled();
        onClose();
      } else {
        console.error('Failed to cancel help request:', response.error);
        toast.error(`Failed to cancel help request: ${response.error}`);
      }
    } catch (error) {
      console.error('Error cancelling help request:', error);
      toast.error('An unexpected error occurred while cancelling your request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            Cancel Help Request
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel this help request? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <h3 className="font-medium mb-2">Request Title:</h3>
          <p className="text-muted-foreground mb-4">{requestTitle}</p>
          
          <label htmlFor="cancellation_reason" className="block text-sm font-medium mb-1">
            Reason for Cancellation
          </label>
          <Textarea
            id="cancellation_reason"
            value={cancellationReason}
            onChange={(e) => setCancellationReason(e.target.value)}
            placeholder="Please explain why you're cancelling this request..."
            rows={3}
            className="w-full"
            required
          />
        </div>
        
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Keep Request
          </Button>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={handleCancellation} 
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Cancel Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CancelHelpRequestDialog;
