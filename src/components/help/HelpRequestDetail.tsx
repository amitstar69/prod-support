
import React from 'react';
import { HelpRequest } from '../../types/helpRequest';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { NotesSection } from './request-detail/NotesSection';
import { useHelpRequestActions } from '../../hooks/help-request/useHelpRequestActions';
import { useHelpRequestData } from '../../hooks/help-request/useHelpRequestData';
import { useHelpRequestNotes } from '../../hooks/help-request/useHelpRequestNotes';
import { Loader2 } from 'lucide-react';

interface HelpRequestDetailProps {
  ticket?: HelpRequest;
  ticketId?: string;
  onUpdate?: (updatedTicket: HelpRequest) => void;
}

const HelpRequestDetail: React.FC<HelpRequestDetailProps> = ({ 
  ticket: initialTicket,
  ticketId,
  onUpdate
}) => {
  console.log('HelpRequestDetail rendering with:', {
    hasInitialTicket: !!initialTicket,
    ticketId
  });
  
  // Get ticket data using custom hook
  const { 
    ticket, 
    setTicket, 
    isLoading, 
    error 
  } = useHelpRequestData(ticketId, initialTicket);

  // Notes management
  const {
    developerQANotes,
    clientFeedback,
    setDeveloperQANotes,
    setClientFeedback
  } = useHelpRequestNotes(ticket);
  
  // Get ticket operations from custom hook
  const currentTicketId = ticket?.id || ticketId || '';
  const { isSaving, updateStatus, saveNotes } = useHelpRequestActions(
    currentTicketId, 
    (updatedTicket) => {
      setTicket(updatedTicket);
      onUpdate?.(updatedTicket);
    }
  );

  // Handle saving notes
  const handleSaveNotes = async () => {
    await saveNotes({
      developer_qa_notes: developerQANotes,
      client_feedback: clientFeedback
    });
  };

  // Handle error state
  if (error) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

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

  // If we only have ticketId but no ticket data yet, show loading
  if (isLoading) {
    return (
      <div className="p-4">
        <Alert>
          <AlertTitle>Loading</AlertTitle>
          <AlertDescription>Loading ticket information...</AlertDescription>
        </Alert>
      </div>
    );
  }

  // If we haven't loaded a ticket yet
  if (!ticket) {
    return (
      <div className="p-4">
        <Alert>
          <AlertTitle>No Ticket Found</AlertTitle>
          <AlertDescription>Unable to load ticket information.</AlertDescription>
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
        {/* Basic Information */}
        <div className="grid gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={ticket.description || ''}
            readOnly
            className="resize-none"
          />
        </div>

        {/* Technical Details */}
        <div className="grid gap-2">
          <Label htmlFor="technicalArea">Technical Area</Label>
          <Input
            id="technicalArea"
            value={ticket.technical_area?.join(', ') || ''}
            readOnly
          />
        </div>

        {/* Status and Metadata */}
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

        {/* Notes Section */}
        <NotesSection 
          developerQANotes={developerQANotes}
          clientFeedback={clientFeedback}
          onDeveloperNotesChange={setDeveloperQANotes}
          onClientFeedbackChange={setClientFeedback}
        />
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => updateStatus('resolved')}>
          Mark as Resolved
        </Button>
        <Button onClick={handleSaveNotes} disabled={isSaving}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Notes
        </Button>
      </CardFooter>
    </Card>
  );
};

export default HelpRequestDetail;
