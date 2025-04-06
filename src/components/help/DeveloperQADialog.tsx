
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { CircleCheck, Loader2 } from 'lucide-react';
import { supabase } from '../../integrations/supabase/client';

interface DeveloperQADialogProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: string;
  requestTitle: string;
  onQASubmitted: () => void;
}

const DeveloperQADialog: React.FC<DeveloperQADialogProps> = ({
  isOpen,
  onClose,
  requestId,
  requestTitle,
  onQASubmitted
}) => {
  const [qaNote, setQaNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async () => {
    if (!qaNote.trim()) {
      toast.error('Please provide QA notes before submitting');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const now = new Date().toISOString();
      
      const { error } = await supabase
        .from('help_requests')
        .update({
          status: 'developer-qa',
          qa_start_time: now,
          developer_qa_notes: qaNote
        })
        .eq('id', requestId);
      
      if (error) {
        console.error('Error submitting QA:', error);
        toast.error('Failed to submit QA notes');
        return;
      }
      
      toast.success('QA submitted successfully');
      onQASubmitted();
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
          <DialogTitle>Submit for Quality Assurance</DialogTitle>
          <DialogDescription>
            Complete your quality assurance for "{requestTitle}" and submit for client review.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="qa-notes">QA Notes</Label>
            <Textarea
              id="qa-notes"
              placeholder="Describe the work you've completed, testing performed, and any notes for the client..."
              rows={6}
              value={qaNote}
              onChange={(e) => setQaNote(e.target.value)}
              className="resize-none"
            />
          </div>
          
          <div className="bg-blue-50 p-3 rounded-md border border-blue-100 text-sm text-blue-700">
            <div className="flex items-start gap-2">
              <CircleCheck className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium mb-1">Ready for client review?</p>
                <p>By submitting, you confirm that you have completed the requested work and it is ready for client review.</p>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : "Submit for Review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeveloperQADialog;
