
import { supabase } from '../integrations/supabase/client';

export enum TicketStatus {
  OPEN = 'open',
  PENDING_REVIEW = 'pending_review',
  ACCEPTED = 'accepted',
  IN_PROGRESS = 'in_progress',
  NEEDS_INFO = 'needs_info',
  COMPLETED = 'completed',
  CLOSED = 'closed'
}

interface StatusTransition {
  nextStatuses: TicketStatus[];
  allowedRoles: ('developer' | 'client')[];
  label: string;
  description: string;
}

export const statusTransitions: Record<TicketStatus, StatusTransition> = {
  [TicketStatus.OPEN]: {
    nextStatuses: [TicketStatus.ACCEPTED, TicketStatus.CLOSED],
    allowedRoles: ['developer', 'client'],
    label: 'Open',
    description: 'Ticket is available for developers to accept'
  },
  [TicketStatus.ACCEPTED]: {
    nextStatuses: [TicketStatus.IN_PROGRESS, TicketStatus.CLOSED],
    allowedRoles: ['developer'],
    label: 'Accepted',
    description: 'Developer has accepted the ticket'
  },
  [TicketStatus.IN_PROGRESS]: {
    nextStatuses: [TicketStatus.NEEDS_INFO, TicketStatus.COMPLETED],
    allowedRoles: ['developer'],
    label: 'In Progress',
    description: 'Developer is actively working on the ticket'
  },
  [TicketStatus.NEEDS_INFO]: {
    nextStatuses: [TicketStatus.IN_PROGRESS, TicketStatus.CLOSED],
    allowedRoles: ['developer', 'client'],
    label: 'Needs Info',
    description: 'Additional information is required'
  },
  [TicketStatus.COMPLETED]: {
    nextStatuses: [TicketStatus.CLOSED, TicketStatus.NEEDS_INFO],
    allowedRoles: ['client'],
    label: 'Completed',
    description: 'Work has been completed, awaiting client review'
  },
  [TicketStatus.CLOSED]: {
    nextStatuses: [],
    allowedRoles: [],
    label: 'Closed',
    description: 'Ticket has been closed'
  },
  [TicketStatus.PENDING_REVIEW]: {
    nextStatuses: [TicketStatus.COMPLETED, TicketStatus.NEEDS_INFO],
    allowedRoles: ['client'],
    label: 'Pending Review',
    description: 'Awaiting client review'
  }
};

// Function to check if status transition is valid
export const isValidStatusTransition = (
  currentStatus: TicketStatus,
  newStatus: TicketStatus,
  userType: 'developer' | 'client'
): boolean => {
  const transition = statusTransitions[currentStatus];
  return (
    transition.nextStatuses.includes(newStatus) &&
    transition.allowedRoles.includes(userType)
  );
};

// Function to get status label
export const getStatusLabel = (status: string): string => {
  return (statusTransitions[status as TicketStatus]?.label || status)
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Function to get status description
export const getStatusDescription = (status: string): string => {
  return statusTransitions[status as TicketStatus]?.description || 'Status description not available';
};

// Function to get next allowed statuses for a user type
export const getAllowedStatusTransitions = (
  currentStatus: string,
  userType: 'developer' | 'client'
): string[] => {
  const transition = statusTransitions[currentStatus as TicketStatus];
  if (!transition || !transition.allowedRoles.includes(userType)) {
    return [];
  }
  return transition.nextStatuses;
};

// Function to update ticket status
export const updateTicketStatus = async (
  ticketId: string,
  newStatus: TicketStatus,
  userType: 'developer' | 'client',
  notes?: string
): Promise<any> => {
  try {
    // Get current ticket
    const { data: ticket, error: fetchError } = await supabase
      .from('help_requests')
      .select('*')
      .eq('id', ticketId)
      .single();

    if (fetchError || !ticket) {
      throw new Error('Failed to fetch ticket');
    }

    // Check if transition is valid
    if (!isValidStatusTransition(ticket.status as TicketStatus, newStatus, userType)) {
      throw new Error(`Invalid status transition from ${ticket.status} to ${newStatus}`);
    }

    // Update ticket status
    const updateData: Record<string, any> = { 
      status: newStatus,
      updated_at: new Date().toISOString()
    };
    
    // Add notes based on user type
    if (notes) {
      if (userType === 'developer') {
        updateData.developer_qa_notes = notes;
      } else if (userType === 'client') {
        updateData.client_feedback = notes;
      }
    }

    const { error: updateError } = await supabase
      .from('help_requests')
      .update(updateData)
      .eq('id', ticketId);

    if (updateError) {
      throw new Error(`Failed to update ticket status: ${updateError.message}`);
    }
    
    // Return updated ticket
    const { data: updatedTicket, error: refreshError } = await supabase
      .from('help_requests')
      .select('*')
      .eq('id', ticketId)
      .single();
      
    if (refreshError || !updatedTicket) {
      throw new Error('Failed to fetch updated ticket');
    }
    
    return updatedTicket;
  } catch (error) {
    console.error('Error updating ticket status:', error);
    throw error;
  }
};
