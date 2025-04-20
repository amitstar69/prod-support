
import React, { useState } from 'react';
import { HelpRequest } from '../../types/helpRequest';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { toast } from '../ui/use-toast';
import { updateHelpRequest } from '../../integrations/supabase/helpRequests';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { isApiSuccess, isApiError } from '../../types/api';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';

interface HelpRequestDetailProps {
  ticket?: HelpRequest;
  ticketId?: string;
  onUpdate?: (updatedTicket: HelpRequest) => void;
}

const HelpRequestDetail: React.FC<HelpRequestDetailProps> = ({ 
  ticket,
  ticketId,
  onUpdate
}) => {
  // Skip if no ticket is provided
  if (!ticket && !ticketId) {
    return (
      <div className="p-4">
        <Alert>
          <AlertTitle>No Information Available</AlertTitle>
          <AlertDescription>No ticket information provided.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const [developerQANotes, setDeveloperQANotes] = useState<string>(ticket?.developer_qa_notes || '');
  const [clientFeedback, setClientFeedback] = useState<string>(ticket?.client_feedback || '');
  const [isSaving, setIsSaving] = useState(false);
  const currentTicketId = ticket?.id || ticketId || '';

  const handleStatusUpdate = async (newStatus: string) => {
    const response = await updateHelpRequest(currentTicketId, { status: newStatus });
    
    if (isApiSuccess(response)) {
      onUpdate?.(response.data);
      toast("Status updated successfully");
    } else if (isApiError(response)) {
      toast(response.error || "Failed to update status");
    }
  };

  const handleSaveNotes = async () => {
    setIsSaving(true);
    try {
      const response = await updateHelpRequest(currentTicketId, { 
        developer_qa_notes: developerQANotes,
        client_feedback: clientFeedback
      });
      
      if (isApiSuccess(response)) {
        onUpdate?.(response.data);
        toast("Notes saved successfully");
      } else if (isApiError(response)) {
        toast(response.error || "Failed to save notes");
      }
    } catch (error) {
      toast("An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  // If we only have ticketId but no ticket data, show loading or fetch the ticket
  if (!ticket) {
    return (
      <div className="p-4">
        <Alert>
          <AlertTitle>Loading</AlertTitle>
          <AlertDescription>Loading ticket information...</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{ticket.title}</CardTitle>
        <CardDescription>Ticket Number: {ticket.ticket_number}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={ticket.description || ''}
            readOnly
            className="resize-none"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="technicalArea">Technical Area</Label>
          <Input
            id="technicalArea"
            value={ticket.technical_area?.join(', ') || ''}
            readOnly
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="urgency">Urgency</Label>
          <Input
            id="urgency"
            value={ticket.urgency || ''}
            readOnly
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="status">Status</Label>
          <div className="flex items-center space-x-2">
            <Input
              id="status"
              value={ticket.status || ''}
              readOnly
            />
            <Badge variant="secondary">{ticket.status}</Badge>
          </div>
        </div>

        {/* Developer QA Notes Section */}
        <div className="grid gap-2">
          <Label htmlFor="developerQANotes">Developer QA Notes</Label>
          <Textarea
            id="developerQANotes"
            placeholder="Add your QA notes here..."
            value={developerQANotes}
            onChange={(e) => setDeveloperQANotes(e.target.value)}
            className="resize-none"
          />
        </div>

        {/* Client Feedback Section */}
        <div className="grid gap-2">
          <Label htmlFor="clientFeedback">Client Feedback</Label>
          <Textarea
            id="clientFeedback"
            placeholder="Enter client feedback here..."
            value={clientFeedback}
            onChange={(e) => setClientFeedback(e.target.value)}
            className="resize-none"
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => handleStatusUpdate('resolved')}>
          Mark as Resolved
        </Button>
        <Button onClick={handleSaveNotes} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Notes'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default HelpRequestDetail;
