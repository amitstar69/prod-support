
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { toast } from 'sonner';
import { submitDeveloperApplication } from '../../integrations/supabase/helpRequestsApplications';

interface DeveloperApplicationModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  requestId?: string;
  userId?: string | null;
  onSuccess?: (data: any) => void;
}

const DeveloperApplicationModal: React.FC<DeveloperApplicationModalProps> = ({
  isOpen,
  onOpenChange,
  requestId,
  userId,
  onSuccess
}) => {
  const [message, setMessage] = useState('');
  const [rate, setRate] = useState('');
  const [duration, setDuration] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState('');

  const resetForm = () => {
    setMessage('');
    setRate('');
    setDuration('');
    setSubmissionError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isOpen || !userId || !requestId) return;
    
    setIsSubmitting(true);
    setSubmissionError('');
    
    try {
      const result = await submitDeveloperApplication(
        requestId,
        userId,
        message,
        parseFloat(rate || '0'),
        parseInt(duration || '0')
      );
      
      if (!result.success) {
        setSubmissionError(result.error || 'Failed to submit application');
        return;
      }
      
      toast.success('Application submitted successfully!');
      if (onSuccess) {
        onSuccess(result.data);
      }
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Error submitting application:', error);
      setSubmissionError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Apply for this Request</DialogTitle>
          <DialogDescription>
            Submit your application to help with this request.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Why do you want to help with this request?"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="rate">Proposed Rate (optional)</Label>
            <Input
              type="number"
              id="rate"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              placeholder="Enter your proposed hourly rate"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="duration">Estimated Duration (optional)</Label>
            <Input
              type="number"
              id="duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="Enter your estimated duration in hours"
            />
          </div>
          {submissionError && (
            <p className="text-red-500">{submissionError}</p>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DeveloperApplicationModal;
