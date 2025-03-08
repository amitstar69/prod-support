
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
      
      console.log('Submitting application with data:', {
        request_id: ticket.id,
        developer_id: userId,
        status: 'pending',
        match_score: 85,
        proposed_message: message,
        proposed_duration: estimatedTime,
        proposed_rate: proposedRate
      });
      
      // Check if an application already exists for this developer and request
      const { data: existingMatch, error: checkError } = await supabase
        .from('help_request_matches')
        .select('*')
        .eq('developer_id', userId)
        .eq('request_id', ticket.id)
        .maybeSingle();
        
      if (checkError) {
        console.error('Error checking existing application:', checkError);
        toast.error('Error checking existing applications. Please try again.');
        setIsSubmitting(false);
        return;
      }
      
      if (existingMatch) {
        // Update existing application instead of creating a new one
        const { data: updatedData, error: updateError } = await supabase
          .from('help_request_matches')
          .update({
            proposed_message: message,
            proposed_duration: estimatedTime,
            proposed_rate: proposedRate,
            match_score: 85,
            status: 'pending'
          })
          .eq('id', existingMatch.id)
          .select();
          
        if (updateError) {
          console.error('Error updating application:', updateError);
          toast.error('Failed to update your application. Please try again.');
          setIsSubmitting(false);
          return;
        }
        
        console.log('Application updated successfully:', updatedData);
        toast.success('Application updated successfully!');
        onApplicationSuccess();
        onClose();
        setIsSubmitting(false);
        return;
      }
      
      // Create a new match record in the database
      const { data, error } = await supabase
        .from('help_request_matches')
        .insert({
          request_id: ticket.id,
          developer_id: userId,
          status: 'pending',
          match_score: 85, // Some calculated score based on skills match
          proposed_message: message,
          proposed_duration: estimatedTime,
          proposed_rate: proposedRate
        })
        .select()
        .single();

      if (error) {
        console.error('Error submitting application:', error);
        toast.error(`Failed to submit your application: ${error.message}`);
        setIsSubmitting(false);
        return;
      }

      console.log('Application submitted successfully:', data);

      // Update the ticket status to 'matching' if it was 'pending'
      if (ticket.status === 'pending') {
        const { error: updateError } = await supabase
          .from('help_requests')
          .update({ status: 'matching' })
          .eq('id', ticket.id);

        if (updateError) {
          console.error('Error updating ticket status:', updateError);
          // Not critical, so just log it
        }
      }

      toast.success('Application submitted successfully!');
      onApplicationSuccess();
      onClose();
      setIsSubmitting(false);
      
    } catch (error) {
      console.error('Exception submitting application:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast.error(`Error: ${errorMessage}. Please try again.`);
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (value: number) => {
    return `$${value}`;
  };

  const calculateTotalCost = () => {
    const hourlyRate = proposedRate;
    const hours = estimatedTime / 60;
    return formatCurrency(Math.round(hourlyRate * hours));
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
