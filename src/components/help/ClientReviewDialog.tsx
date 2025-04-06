
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Check, ThumbsUp, ThumbsDown, Loader2 } from 'lucide-react';
import { supabase } from '../../integrations/supabase/client';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';

interface ClientReviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: string;
  requestTitle: string;
  developerQANotes?: string;
  onReviewSubmitted: () => void;
}

const ClientReviewDialog: React.FC<ClientReviewDialogProps> = ({
  isOpen,
  onClose,
  requestId,
  requestTitle,
  developerQANotes,
  onReviewSubmitted
}) => {
  const [feedback, setFeedback] = useState('');
  const [approval, setApproval] = useState<'approved' | 'rejected' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async () => {
    if (!approval) {
      toast.error('Please select whether you approve or reject the work');
      return;
    }
    
    if (!feedback.trim()) {
      toast.error('Please provide feedback before submitting');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const now = new Date().toISOString();
      
      const { error } = await supabase
        .from('help_requests')
        .update({
          status: approval === 'approved' ? 'client-approved' : 'in-progress',
          client_review_start_time: now,
          client_review_complete_time: now,
          client_feedback: feedback
        })
        .eq('id', requestId);
      
      if (error) {
        console.error('Error submitting review:', error);
        toast.error('Failed to submit review');
        return;
      }
      
      toast.success(
        approval === 'approved' 
          ? 'Work approved successfully!' 
          : 'Feedback submitted. The ticket has been returned to the developer.'
      );
      onReviewSubmitted();
      onClose();
    } catch (error) {
      console.error('Exception in handleSubmit:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Review Developer's Work</DialogTitle>
          <DialogDescription>
            Review the completed work for "{requestTitle}" and provide your feedback.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          {developerQANotes && (
            <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
              <h3 className="text-sm font-medium text-blue-800 mb-2">Developer QA Notes:</h3>
              <p className="text-sm text-blue-700 whitespace-pre-line">{developerQANotes}</p>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="approval" className="mb-2 block">Do you approve this work?</Label>
              <RadioGroup onValueChange={(val) => setApproval(val as 'approved' | 'rejected')}>
                <div className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value="approved" id="approved" />
                  <Label htmlFor="approved" className="flex items-center">
                    <ThumbsUp className="h-4 w-4 mr-2 text-green-500" />
                    Yes, approve the work
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="rejected" id="rejected" />
                  <Label htmlFor="rejected" className="flex items-center">
                    <ThumbsDown className="h-4 w-4 mr-2 text-red-500" />
                    No, needs more work
                  </Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="feedback">Your Feedback</Label>
              <Textarea
                id="feedback"
                placeholder={approval === 'approved' 
                  ? "Provide any feedback about the completed work..." 
                  : "Please explain what needs to be changed or fixed..."}
                rows={4}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="resize-none"
              />
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            variant={approval === 'approved' ? 'default' : 'destructive'}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : approval === 'approved' ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Approve Work
              </>
            ) : (
              'Request Changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ClientReviewDialog;
