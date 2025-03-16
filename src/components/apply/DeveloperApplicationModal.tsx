import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../integrations/supabase/client';
import { useAuth } from '../../contexts/auth';
import { HelpRequest } from '../../types/helpRequest';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Slider } from '../ui/slider';
import { submitDeveloperApplication } from '../../integrations/supabase/helpRequests';
import { isLocalId } from '../../integrations/supabase/helpRequestsUtils';

interface DeveloperApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: HelpRequest;
  onApplicationSuccess: () => void;
}

const DeveloperApplicationModal: React.FC<DeveloperApplicationModalProps> = ({
  isOpen,
  onClose,
  ticket,
  onApplicationSuccess
}) => {
  const { userId } = useAuth();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [estimatedTime, setEstimatedTime] = useState(ticket.estimated_duration || 30);
  const [proposedRate, setProposedRate] = useState(75); // Default hourly rate in USD
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!userId) {
      toast.error('You must be logged in to apply for this request');
      return;
    }

    if (!message.trim()) {
      toast.error('Please provide a brief message to the client');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Ensure the rate is properly formatted to avoid numeric overflow
      const formattedRate = Math.min(parseFloat(proposedRate.toFixed(2)), 999.99);
      
      console.log('Submitting application with data:', {
        request_id: ticket.id,
        developer_id: userId,
        status: 'pending',
        match_score: 85,
        proposed_message: message,
        proposed_duration: estimatedTime,
        proposed_rate: formattedRate
      });

      // Check if this is a local storage ticket (starts with "help-")
      if (isLocalId(ticket.id)) {
        // ... keep existing code (local storage handling)
        const localApplications = JSON.parse(localStorage.getItem('help_request_matches') || '[]');
        
        // Check if an application already exists
        const existingIndex = localApplications.findIndex(
          (app: any) => app.developer_id === userId && app.request_id === ticket.id
        );
        
        if (existingIndex >= 0) {
          // Update existing application
          localApplications[existingIndex] = {
            ...localApplications[existingIndex],
            proposed_message: message,
            proposed_duration: estimatedTime,
            proposed_rate: formattedRate,
            match_score: 85,
            status: 'pending',
            updated_at: new Date().toISOString()
          };
          
          localStorage.setItem('help_request_matches', JSON.stringify(localApplications));
          toast.success('Application updated successfully!');
          onApplicationSuccess();
          onClose();
          setIsSubmitting(false);
          return;
        }
        
        // Create new application
        const newApplication = {
          id: `app-${Date.now()}`,
          request_id: ticket.id,
          developer_id: userId,
          status: 'pending',
          match_score: 85,
          proposed_message: message,
          proposed_duration: estimatedTime,
          proposed_rate: formattedRate,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        localApplications.push(newApplication);
        localStorage.setItem('help_request_matches', JSON.stringify(localApplications));
        
        // Update the ticket status to 'matching' if it was 'pending'
        const localHelpRequests = JSON.parse(localStorage.getItem('helpRequests') || '[]');
        const ticketIndex = localHelpRequests.findIndex((req: HelpRequest) => req.id === ticket.id);
        
        if (ticketIndex >= 0 && localHelpRequests[ticketIndex].status === 'pending') {
          localHelpRequests[ticketIndex].status = 'matching';
          localStorage.setItem('helpRequests', JSON.stringify(localHelpRequests));
        }
        
        toast.success('Application submitted successfully!');
        onApplicationSuccess();
        onClose();
        setIsSubmitting(false);
        return;
      }
      
      // For database tickets, use the submit function with formatted values
      const result = await submitDeveloperApplication(
        ticket.id, 
        userId, 
        {
          proposed_message: message,
          proposed_duration: estimatedTime,
          proposed_rate: formattedRate
        }
      );

      if (!result.success) {
        throw new Error(result.error || 'Failed to submit application');
      }

      toast.success(result.isUpdate ? 'Application updated successfully!' : 'Application submitted successfully!');
      onApplicationSuccess();
      onClose();
    } catch (error) {
      console.error('Exception submitting application:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast.error(`Error: ${errorMessage}. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (value: number) => {
    return `$${value.toFixed(2)}`;
  };

  const calculateTotalCost = () => {
    const hourlyRate = proposedRate;
    const hours = estimatedTime / 60;
    return formatCurrency(Math.round(hourlyRate * hours * 100) / 100);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open && !isSubmitting) {
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Apply for Help Request</DialogTitle>
          <DialogDescription>
            Send your application to help with this request. The client will review your proposal.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <h3 className="text-lg font-medium">{ticket.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{ticket.description}</p>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Your Message to Client</label>
            <Textarea
              placeholder="Introduce yourself and explain how you can help with this request..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="resize-none"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">Estimated Duration</label>
              <span className="text-sm">{estimatedTime} minutes</span>
            </div>
            <Slider
              value={[estimatedTime]}
              min={15}
              max={180}
              step={15}
              onValueChange={(values) => setEstimatedTime(values[0])}
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              Client's estimate: {ticket.estimated_duration} minutes
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">Your Hourly Rate</label>
              <span className="text-sm">{formatCurrency(proposedRate)}/hr</span>
            </div>
            <Slider
              value={[proposedRate]}
              min={25}
              max={200}
              step={5}
              onValueChange={(values) => setProposedRate(values[0])}
              disabled={isSubmitting}
            />
          </div>

          <div className="bg-muted p-3 rounded-lg">
            <div className="flex justify-between items-center text-sm">
              <span>Estimated total cost:</span>
              <span className="font-medium">{calculateTotalCost()}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Based on {estimatedTime} minutes at {formatCurrency(proposedRate)}/hour
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={isSubmitting}
            type="button"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            type="button"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Application'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeveloperApplicationModal;
