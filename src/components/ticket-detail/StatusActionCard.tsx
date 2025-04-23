
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import ClientActionStatus from '../client-actions/ClientActionStatus';
import { HelpRequest } from '../../types/helpRequest';

interface StatusActionCardProps {
  ticket: HelpRequest;
  onStatusUpdated?: () => void;
}

/**
 * StatusActionCard - A wrapper component that displays status update actions
 * for client users viewing a ticket
 */
const StatusActionCard: React.FC<StatusActionCardProps> = ({
  ticket,
  onStatusUpdated
}) => {
  if (!ticket || !ticket.id) return null;
  
  // Only show for specific statuses where client action is needed
  const clientActionableStatuses = [
    'awaiting_client_approval', 
    'ready_for_client_qa', 
    'qa_pass', 
    'ready_for_final_action'
  ];
  
  if (!clientActionableStatuses.includes(ticket.status || '')) {
    return null;
  }

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Client Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <ClientActionStatus 
          ticketId={ticket.id} 
          currentStatus={ticket.status}
          onStatusUpdate={onStatusUpdated}
        />
      </CardContent>
    </Card>
  );
};

export default StatusActionCard;
