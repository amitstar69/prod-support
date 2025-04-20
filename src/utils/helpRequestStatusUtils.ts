
// Status transition definitions
export const STATUS_TRANSITIONS = {
  developer: {
    'in-progress': ['developer-qa'],
    'developer-qa': ['client-review'],
    'client-approved': ['completed']
  },
  client: {
    'client-review': ['client-approved', 'in-progress'],
    'completed': ['in-progress']
  }
};

export type UserType = 'client' | 'developer';

// Helper function to check if a status transition is valid
export const isValidStatusTransition = (
  currentStatus: string,
  newStatus: string,
  userType: UserType
): boolean => {
  const transitions = userType === 'developer' ? STATUS_TRANSITIONS.developer : STATUS_TRANSITIONS.client;
  return transitions[currentStatus as keyof typeof transitions]?.includes(newStatus) || false;
};

// Get next logical status in the workflow
export const getNextStatus = (currentStatus: string, userType: UserType): string | null => {
  const transitions = userType === 'developer' ? STATUS_TRANSITIONS.developer : STATUS_TRANSITIONS.client;
  const nextStatuses = transitions[currentStatus as keyof typeof transitions];
  
  return nextStatuses && nextStatuses.length > 0 ? nextStatuses[0] : null;
};

// Get human-readable status label
export const getStatusLabel = (status: string): string => {
  const statusLabels: Record<string, string> = {
    'in-progress': 'In Progress',
    'developer-qa': 'Developer QA',
    'client-review': 'Client Review',
    'client-approved': 'Client Approved',
    'completed': 'Completed',
    'cancelled': 'Cancelled'
  };

  return statusLabels[status] || status;
};

// Get status descriptions
export const getStatusDescription = (status: string): string => {
  const statusDescriptions: Record<string, string> = {
    'in-progress': 'Developer is actively working on this request',
    'developer-qa': 'Developer has completed work and is reviewing quality',
    'client-review': 'Work is ready for client to review',
    'client-approved': 'Client has approved the work',
    'completed': 'Request has been completed',
    'cancelled': 'Request has been cancelled'
  };

  return statusDescriptions[status] || 'Status information unavailable';
};

// Get allowed actions for a user type and status
export const getAllowedActions = (status: string, userType: UserType): string[] => {
  const transitions = userType === 'developer' ? STATUS_TRANSITIONS.developer : STATUS_TRANSITIONS.client;
  return transitions[status as keyof typeof transitions] || [];
};

// Get status type (for styling, etc)
export const getStatusType = (status: string): 'info' | 'warning' | 'success' | 'error' | 'neutral' => {
  switch (status) {
    case 'in-progress':
      return 'info';
    case 'developer-qa':
    case 'client-review':
      return 'warning';
    case 'client-approved':
    case 'completed':
      return 'success';
    case 'cancelled':
      return 'error';
    default:
      return 'neutral';
  }
};

// Global status constants
export const STATUSES = {
  OPEN: 'open',
  CLAIMED: 'claimed',
  IN_PROGRESS: 'in-progress',
  DEVELOPER_QA: 'developer-qa',
  CLIENT_REVIEW: 'client-review',
  CLIENT_APPROVED: 'client-approved',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};
