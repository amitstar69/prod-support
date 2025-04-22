export enum TicketStatus {
  OPEN = 'open',
  ACCEPTED = 'accepted',
  IN_PROGRESS = 'in_progress',
  NEEDS_INFO = 'needs_info',
  COMPLETED = 'completed',
  CLOSED = 'closed',
  PENDING_REVIEW = 'pending_review',
  PENDING_MATCH = 'pending_match',
  DEV_REQUESTED = 'dev_requested',
  AWAITING_CLIENT_APPROVAL = 'awaiting_client_approval',
  QA_FAIL = 'qa_fail',
  QA_PASS = 'qa_pass',
  RESOLVED = 'resolved',
  READY_FOR_FINAL_ACTION = 'ready_for_final_action',
  CANCELLED_BY_CLIENT = 'cancelled_by_client'
}

export const getTicketStatusStyles = (status: string) => {
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
    'cancelled_by_client': `${baseClasses} bg-red-200 text-red-800`
  };

  return statusStyles[status] || `${baseClasses} bg-gray-100 text-gray-800`;
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
  from: TicketStatus;
  to: TicketStatus[];
  roles: ('developer' | 'client')[];
}

const statusTransitions: StatusTransition[] = [
  {
    from: TicketStatus.OPEN,
    to: [TicketStatus.ACCEPTED, TicketStatus.CLOSED],
    roles: ['developer']
  },
  {
    from: TicketStatus.ACCEPTED,
    to: [TicketStatus.IN_PROGRESS],
    roles: ['developer']
  },
  {
    from: TicketStatus.IN_PROGRESS,
    to: [TicketStatus.NEEDS_INFO, TicketStatus.COMPLETED],
    roles: ['developer']
  },
  {
    from: TicketStatus.NEEDS_INFO,
    to: [TicketStatus.IN_PROGRESS],
    roles: ['developer', 'client']
  },
  {
    from: TicketStatus.COMPLETED,
    to: [TicketStatus.NEEDS_INFO, TicketStatus.CLOSED],
    roles: ['client']
  }
];

export const isValidStatusTransition = (
  from: TicketStatus,
  to: TicketStatus,
  role: 'developer' | 'client'
): boolean => {
  const transition = statusTransitions.find(t => t.from === from);
  if (!transition) return false;
  
  return transition.to.includes(to) && transition.roles.includes(role);
};

export const getAllowedStatusTransitions = (
  status: string,
  role: 'developer' | 'client'
): TicketStatus[] => {
  const currentStatus = Object.values(TicketStatus).find(s => s === status);
  
  if (!currentStatus) {
    return [];
  }
  
  const transition = statusTransitions.find(t => t.from === currentStatus);
  
  if (!transition) {
    return [];
  }
  
  return transition.to.filter(to => {
    const validRole = transition.roles.includes(role);
    return validRole;
  });
};

export const updateTicketStatus = async (
  ticketId: string,
  newStatus: TicketStatus,
  userType: string,
  notes?: string
): Promise<any> => {
  console.log(`Updating ticket ${ticketId} to ${newStatus} by ${userType}${notes ? ` with notes: ${notes}` : ''}`);
  
  return {
    id: ticketId,
    status: newStatus,
    updated_at: new Date().toISOString()
  };
};
