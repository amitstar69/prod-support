
import { HelpRequest } from '../../types/helpRequest';
import { TicketStatus } from '../../utils/ticketStatusUtils';

export const useTicketFilters = (tickets: HelpRequest[]) => {
  const getFilteredTickets = (userType: 'developer' | 'client' | null) => {
    if (!userType || !tickets.length) {
      return {
        openTickets: [],
        activeTickets: [],
        myTickets: [],
        completedTickets: []
      };
    }

    if (userType === 'developer') {
      return {
        openTickets: tickets.filter(t => t.status === TicketStatus.OPEN),
        myTickets: tickets.filter(t => 
          [TicketStatus.ACCEPTED, TicketStatus.IN_PROGRESS, TicketStatus.NEEDS_INFO]
            .includes(t.status as TicketStatus)
        ),
        completedTickets: tickets.filter(t => 
          [TicketStatus.COMPLETED, TicketStatus.CLOSED]
            .includes(t.status as TicketStatus)
        ),
        activeTickets: [] // For type consistency
      };
    } else {
      return {
        activeTickets: tickets.filter(t => 
          [TicketStatus.OPEN, TicketStatus.ACCEPTED, TicketStatus.IN_PROGRESS, TicketStatus.NEEDS_INFO]
            .includes(t.status as TicketStatus)
        ),
        completedTickets: tickets.filter(t => 
          [TicketStatus.COMPLETED, TicketStatus.CLOSED]
            .includes(t.status as TicketStatus)
        ),
        openTickets: [], // For type consistency
        myTickets: [] // For type consistency
      };
    }
  };

  return { getFilteredTickets };
};
