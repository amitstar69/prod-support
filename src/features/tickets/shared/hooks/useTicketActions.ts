
import { useState, useCallback } from 'react';
import { Ticket, TicketStatus } from '../types/ticket';
import { toast } from 'sonner';

export interface TicketAction {
  key: string;
  label: string;
  icon?: React.ElementType;
  handler: (ticket: Ticket) => Promise<void>;
  isAvailable: (ticket: Ticket, userId: string, userType: 'client' | 'developer') => boolean;
}

export const useTicketActions = (
  userId: string,
  userType: 'client' | 'developer',
  refreshTickets: () => Promise<void>
) => {
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);

  const handleTicketAction = useCallback(async (
    ticket: Ticket,
    action: (ticket: Ticket) => Promise<boolean>,
    actionName: string
  ) => {
    setIsActionLoading(ticket.id);
    try {
      const success = await action(ticket);
      if (success) {
        toast.success(`Ticket ${actionName} successfully`);
        await refreshTickets();
      } else {
        toast.error(`Failed to ${actionName.toLowerCase()} ticket`);
      }
    } catch (error: any) {
      console.error(`Error ${actionName.toLowerCase()} ticket:`, error);
      toast.error(error.message || `Error ${actionName.toLowerCase()} ticket`);
    } finally {
      setIsActionLoading(null);
    }
  }, [refreshTickets]);

  // Define available ticket actions based on status and user role
  const availableActions: TicketAction[] = [
    // Client actions
    {
      key: 'cancel',
      label: 'Cancel Ticket',
      handler: async (ticket) => {
        await handleTicketAction(
          ticket,
          async () => {
            // Implement ticket cancellation API call here
            console.log('Cancel ticket:', ticket.id);
            return true;
          },
          'cancelled'
        );
      },
      isAvailable: (ticket, uid, type) => {
        return type === 'client' && 
               uid === ticket.clientId && 
               ['draft', 'open', 'assigned'].includes(ticket.status);
      }
    },
    
    // Developer actions
    {
      key: 'apply',
      label: 'Apply',
      handler: async (ticket) => {
        await handleTicketAction(
          ticket,
          async () => {
            // Implement apply to ticket API call here
            console.log('Apply to ticket:', ticket.id);
            return true;
          },
          'applied to'
        );
      },
      isAvailable: (ticket, uid, type) => {
        return type === 'developer' && 
               ticket.status === 'open' && 
               !ticket.developerId;
      }
    },
    
    // Shared actions
    {
      key: 'view',
      label: 'View Details',
      handler: async (ticket) => {
        // Navigation would typically happen here
        console.log('View ticket details:', ticket.id);
      },
      isAvailable: () => true
    }
  ];

  const getActionsForTicket = useCallback((ticket: Ticket) => {
    return availableActions.filter(action => 
      action.isAvailable(ticket, userId, userType)
    );
  }, [availableActions, userId, userType]);

  return {
    getActionsForTicket,
    isActionLoading
  };
};
