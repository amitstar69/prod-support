
import { HELP_REQUEST_STATUSES } from './constants/statusConstants';
import { TicketStatus } from '../types/enums';

// Map old status values to new ones for compatibility
const statusMappings = {
  'submitted': HELP_REQUEST_STATUSES.OPEN,
  'dev_requested': HELP_REQUEST_STATUSES.PENDING_MATCH,
  'pending_developer_approval': HELP_REQUEST_STATUSES.AWAITING_CLIENT_APPROVAL
};

export const getTicketStatusStyles = (status: string) => {
  // If status is one of the old values, map it to its new value
  const normalizedStatus = statusMappings[status.toLowerCase()] || status;
  
  const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';
  
  const statusStyles: Record<string, string> = {
    'open': `${baseClasses} bg-blue-100 text-blue-800`,
    'accepted': `${baseClasses} bg-green-100 text-green-800`,
    'in_progress': `${baseClasses} bg-yellow-100 text-yellow-800`,
    'needs_info': `${baseClasses} bg-orange-100 text-orange-800`,
    'completed': `${baseClasses} bg-green-500 text-white`,
    'closed': `${baseClasses} bg-gray-200 text-gray-800`,
    'pending_review': `${baseClasses} bg-purple-100 text-purple-800`,
    'pending_match': `${baseClasses} bg-indigo-100 text-indigo-800`,
    'dev_requested': `${baseClasses} bg-teal-100 text-teal-800`,
    'awaiting_client_approval': `${baseClasses} bg-pink-100 text-pink-800`,
    'need_more_info': `${baseClasses} bg-orange-100 text-orange-800`,
    'qa_fail': `${baseClasses} bg-red-100 text-red-800`,
    'qa_pass': `${baseClasses} bg-green-300 text-green-800`,
    'resolved': `${baseClasses} bg-green-500 text-white`,
    'ready_for_final_action': `${baseClasses} bg-blue-300 text-blue-800`,
    'cancelled': `${baseClasses} bg-red-200 text-red-800`
  };

  return statusStyles[normalizedStatus] || `${baseClasses} bg-gray-100 text-gray-800`;
};

export const formatTicketStatus = (status: string) => {
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const getStatusLabel = (status: string): string => {
  return formatTicketStatus(status);
};

export const getStatusDescription = (status: string): string => {
  const descriptions: Record<string, string> = {
    'open': 'This ticket is open and waiting for a developer to accept it.',
    'accepted': 'A developer has accepted this ticket and will begin working on it soon.',
    'in_progress': 'Work on this ticket is currently in progress.',
    'needs_info': 'Additional information is needed to proceed with this ticket.',
    'need_more_info': 'Additional information is needed to proceed with this ticket.',
    'completed': 'Work on this ticket has been completed.',
    'closed': 'This ticket has been closed.',
    'pending_review': 'This ticket is waiting for review.',
    'pending_match': 'This ticket is waiting to be matched with a developer.',
    'dev_requested': 'A developer has requested to work on this ticket.',
    'awaiting_client_approval': 'Waiting for client approval to proceed.',
    'qa_fail': 'The work did not pass quality assurance checks.',
    'qa_pass': 'The work has passed quality assurance checks.',
    'resolved': 'The issue has been resolved successfully.',
    'ready_for_final_action': 'Ready for the final action to complete this ticket.',
    'cancelled_by_client': 'This ticket has been cancelled by the client.'
  };

  return descriptions[status] || 'No description available.';
};

interface StatusTransition {
  from: string; // Changed from TicketStatus to string for compatibility
  to: string[]; // Changed from TicketStatus[] to string[]
  roles: ('developer' | 'client')[];
}

const statusTransitions: StatusTransition[] = [
  {
    from: TicketStatus.Open,
    to: [TicketStatus.Accepted, TicketStatus.Closed],
    roles: ['developer']
  },
  {
    from: TicketStatus.Accepted,
    to: [TicketStatus.InProgress],
    roles: ['developer']
  },
  {
    from: TicketStatus.InProgress,
    to: [TicketStatus.NeedsInfo, TicketStatus.Completed],
    roles: ['developer']
  },
  {
    from: TicketStatus.NeedsInfo,
    to: [TicketStatus.InProgress],
    roles: ['developer', 'client']
  },
  {
    from: TicketStatus.Completed,
    to: [TicketStatus.NeedsInfo, TicketStatus.Closed],
    roles: ['client']
  },
  {
    from: TicketStatus.PendingMatch,
    to: [TicketStatus.AwaitingClientApproval, TicketStatus.Cancelled],
    roles: ['developer', 'client']
  },
  {
    from: TicketStatus.AwaitingClientApproval,
    to: [TicketStatus.InProgress, TicketStatus.Cancelled],
    roles: ['client']
  }
];

export const isValidStatusTransition = (
  from: string,
  to: string,
  role: 'developer' | 'client'
): boolean => {
  const transition = statusTransitions.find(t => t.from === from);
  if (!transition) return false;
  
  return transition.to.includes(to) && transition.roles.includes(role);
};

export const getAllowedStatusTransitions = (
  status: string,
  role: 'developer' | 'client'
): string[] => {
  const transition = statusTransitions.find(t => t.from === status);
  
  if (!transition) {
    return [];
  }
  
  return transition.to.filter(to => {
    const validRole = transition.roles.includes(role);
    return validRole;
  });
};

export { UserType } from '../types/enums';

export const updateTicketStatus = async (
  ticketId: string,
  newStatus: string,
  userType: UserType,
  notes?: string
): Promise<any> => {
  console.log(`Updating ticket ${ticketId} to ${newStatus} by ${userType}${notes ? ` with notes: ${notes}` : ''}`);
  
  return {
    id: ticketId,
    status: newStatus,
    updated_at: new Date().toISOString()
  };
};

// Add these functions to fix the test failures
export const STATUSES: string[] = [
  TicketStatus.Open,
  TicketStatus.Accepted, 
  TicketStatus.InProgress,
  TicketStatus.NeedsInfo,
  TicketStatus.Completed
];

export function getNextStatus(currentStatus: string): string {
  const currentIndex = STATUSES.indexOf(currentStatus);
  if (currentIndex === -1 || currentIndex === STATUSES.length - 1) {
    return currentStatus;
  }
  return STATUSES[currentIndex + 1];
}
