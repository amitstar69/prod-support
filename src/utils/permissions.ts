
import { TicketStatus } from './ticketStatusUtils';

interface Permission {
  can: boolean;
  message?: string;
}

export enum PermissionAction {
  VIEW_TICKET = 'view_ticket',
  EDIT_TICKET = 'edit_ticket',
  CLAIM_TICKET = 'claim_ticket',
  CHANGE_STATUS = 'change_status',
  ADD_NOTES = 'add_notes',
  VIEW_DEVELOPER_NOTES = 'view_developer_notes',
  VIEW_CLIENT_FEEDBACK = 'view_client_feedback',
  VIEW_DASHBOARD = 'view_dashboard',
}

export const checkTicketPermission = (
  action: PermissionAction,
  userType: 'developer' | 'client' | null,
  userId: string | null,
  ticket: {
    status: string;
    client_id: string;
    id: string;
  } | null
): Permission => {
  // Not authenticated
  if (!userType || !userId) {
    return { can: false, message: 'You must be logged in' };
  }

  // No ticket provided
  if (!ticket) {
    return { can: false, message: 'Ticket not found' };
  }

  // Role-based permissions
  switch (action) {
    case PermissionAction.VIEW_TICKET:
      // Developers can view all tickets
      if (userType === 'developer') {
        return { can: true };
      }
      // Clients can only view their own tickets
      if (userType === 'client' && ticket.client_id === userId) {
        return { can: true };
      }
      return { can: false, message: 'You do not have permission to view this ticket' };

    case PermissionAction.EDIT_TICKET:
      // Only clients can edit their own tickets if they're in OPEN status
      if (userType === 'client' && 
          ticket.client_id === userId && 
          ticket.status === TicketStatus.OPEN) {
        return { can: true };
      }
      return { can: false, message: 'You cannot edit this ticket' };

    case PermissionAction.CLAIM_TICKET:
      // Only developers can claim open tickets
      if (userType === 'developer' && ticket.status === TicketStatus.OPEN) {
        return { can: true };
      }
      return { can: false, message: 'This ticket cannot be claimed' };

    case PermissionAction.CHANGE_STATUS:
      // Status changes are handled by the statusTransitions logic
      return { can: true };

    case PermissionAction.ADD_NOTES:
      // Developers can add notes to tickets they're working on
      if (userType === 'developer' && 
          [TicketStatus.ACCEPTED, TicketStatus.IN_PROGRESS, TicketStatus.NEEDS_INFO, TicketStatus.COMPLETED]
            .includes(ticket.status as TicketStatus)) {
        return { can: true };
      }
      // Clients can add feedback to their tickets
      if (userType === 'client' && 
          ticket.client_id === userId && 
          [TicketStatus.NEEDS_INFO, TicketStatus.COMPLETED]
            .includes(ticket.status as TicketStatus)) {
        return { can: true };
      }
      return { can: false, message: 'You cannot add notes to this ticket' };

    case PermissionAction.VIEW_DEVELOPER_NOTES:
      // Both developers and the ticket owner can view developer notes
      if (userType === 'developer' || (userType === 'client' && ticket.client_id === userId)) {
        return { can: true };
      }
      return { can: false, message: 'You cannot view developer notes for this ticket' };

    case PermissionAction.VIEW_CLIENT_FEEDBACK:
      // Both developers and the ticket owner can view client feedback
      if (userType === 'developer' || (userType === 'client' && ticket.client_id === userId)) {
        return { can: true };
      }
      return { can: false, message: 'You cannot view client feedback for this ticket' };

    case PermissionAction.VIEW_DASHBOARD:
      // All authenticated users can view their respective dashboards
      return { can: true };

    default:
      return { can: false, message: 'Unknown permission' };
  }
};
