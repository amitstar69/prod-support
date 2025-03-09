import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { HelpRequest } from '@/types/helpRequest';
import { useAuth } from '@/contexts/auth';
import { submitDeveloperApplication } from '@/integrations/supabase/helpRequests';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface DeveloperApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  helpRequest: HelpRequest;
}

const DeveloperApplicationModal: React.FC<DeveloperApplicationModalProps> = ({
  isOpen,
  onClose,
  helpRequest,
}) => {
  const { userId, isAuthenticated } = useAuth();
  const [message, setMessage] = useState('');
  const [proposedDuration, setProposedDuration] = useState(helpRequest.estimated_duration || 60);
  const [proposedRate, setProposedRate] = useState(75);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const estimatedTotal = proposedRate * (proposedDuration / 60);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!isAuthenticated || !userId) {
      toast.error('You must be logged in to apply');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await submitDeveloperApplication(
        helpRequest.id,
        userId,
        {
          proposed_message: message,
          proposed_duration: parseInt(proposedDuration.toString()),
          proposed_rate: parseInt(proposedRate.toString())
        }
      );
      
      if (result.success) {
        toast.success('Application submitted successfully!');
        onClose();
      } else {
        toast.error(`Failed to submit: ${result.error}`);
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('An error occurred while submitting your application');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Apply to Help</DialogTitle>
          <DialogDescription>
            Send a proposal to the client for this help request
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4 space-y-6">
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-medium text-lg">{helpRequest.title}</h3>
            <p className="text-sm text-muted-foreground mt-2">{helpRequest.description}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {helpRequest.technical_area.map((area) => (
                <span key={area} className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                  {area}
                </span>
              ))}
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="message">Message to Client</Label>
              <Textarea
                id="message"
                placeholder="Explain why you're the best developer for this job..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                required
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Estimated Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  min={15}
                  step={15}
                  value={proposedDuration}
                  onChange={(e) => setProposedDuration(Number(e.target.value))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="rate">Hourly Rate ($)</Label>
                <Input
                  id="rate"
                  type="number"
                  min={0}
                  value={proposedRate}
                  onChange={(e) => setProposedRate(Number(e.target.value))}
                  required
                />
              </div>
            </div>
            
            <div className="bg-muted/30 p-3 rounded-lg">
              <p className="text-sm">Estimated Total: <span className="font-semibold">${estimatedTotal.toFixed(2)}</span></p>
              <p className="text-xs text-muted-foreground mt-1">
                Based on {proposedDuration} minutes at ${proposedRate}/hour
              </p>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Send Application'
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeveloperApplicationModal;
