
// Status transition definitions for the help request workflow
export const STATUS_TRANSITIONS = {
  system: {
    'submitted': ['pending_match'],
    'dev_requested': ['awaiting_client_approval'],
    'any': ['cancelled_by_client', 'abandoned_by_dev'] // Special case handled in validation
  },
  developer: {
    'pending_match': ['dev_requested'],
    'approved': ['in_progress'],
    'in_progress': ['ready_for_qa'],
    'any': ['abandoned_by_dev'] // Special case handled in validation
  },
  client: {
    'awaiting_client_approval': ['approved'],
    'ready_for_qa': ['qa_feedback', 'complete'],
    'any': ['cancelled_by_client'] // Special case handled in validation
  }
};

export type UserType = 'client' | 'developer' | 'system';

// Define a proper type for the transitions object structure
type TransitionMap = {
  [key: string]: string[];
};

// Helper function to check if a status transition is valid
export const isValidStatusTransition = (
  currentStatus: string,
  newStatus: string,
  userType: UserType
): boolean => {
  const transitions = STATUS_TRANSITIONS[userType] as TransitionMap;
  
  // Special case for 'any' transitions (cancel/abandon)
  if (newStatus === 'cancelled_by_client' && userType === 'client') {
    return true;
  }
  
  if (newStatus === 'abandoned_by_dev' && userType === 'developer') {
    return true;
  }
  
  // Regular transition check
  const allowedTransitions = transitions[currentStatus];
  return Array.isArray(allowedTransitions) && allowedTransitions.includes(newStatus);
};

// Get next logical status in the workflow
export const getNextStatus = (currentStatus: string, userType: UserType): string | null => {
  const transitions = STATUS_TRANSITIONS[userType] as TransitionMap;
  
  // Use type assertion to help TypeScript understand the structure
  const nextStatuses = transitions[currentStatus];
  
  return Array.isArray(nextStatuses) && nextStatuses.length > 0 ? nextStatuses[0] : null;
};

// Get human-readable status label
export const getStatusLabel = (status: string): string => {
  const statusLabels: Record<string, string> = {
    'submitted': 'Submitted',
    'pending_match': 'Pending Match',
    'dev_requested': 'Developer Requested',
    'awaiting_client_approval': 'Awaiting Client Approval',
    'approved': 'Approved',
    'in_progress': 'In Progress',
    'ready_for_qa': 'Ready for QA',
    'qa_feedback': 'QA Feedback',
    'complete': 'Complete',
    'cancelled_by_client': 'Cancelled by Client',
    'abandoned_by_dev': 'Abandoned by Developer'
  };

  return statusLabels[status] || status;
};

// Get status descriptions
export const getStatusDescription = (status: string): string => {
  const statusDescriptions: Record<string, string> = {
    'submitted': 'Request has been submitted but not yet processed',
    'pending_match': 'Request is awaiting a developer match',
    'dev_requested': 'A developer has requested to be assigned',
    'awaiting_client_approval': 'Awaiting client approval for developer assignment',
    'approved': 'Developer has been approved and can start work',
    'in_progress': 'Developer is actively working on this request',
    'ready_for_qa': 'Developer has completed work and it is ready for client review',
    'qa_feedback': 'Client has provided feedback requiring changes',
    'complete': 'Request has been completed successfully',
    'cancelled_by_client': 'Request was cancelled by the client',
    'abandoned_by_dev': 'Developer has abandoned this request'
  };

  return statusDescriptions[status] || 'Status information unavailable';
};

// Helper function to check if the current user can update to a given status
export const canUpdateToStatus = (
  currentStatus: string,
  newStatus: string,
  userType: UserType
): boolean => {
  return isValidStatusTransition(currentStatus, newStatus, userType);
};

// Get allowed statuses based on current status and user type
export const getAllowedStatusTransitions = (
  currentStatus: string,
  userType: UserType
): string[] => {
  const transitions = STATUS_TRANSITIONS[userType] as TransitionMap;
  
  // Start with regular transitions
  let allowedTransitions = transitions[currentStatus] || [];
  
  // Add special 'any' transitions if applicable
  if (userType === 'client' && transitions['any']) {
    allowedTransitions = [...allowedTransitions, ...transitions['any']];
  } else if (userType === 'developer' && transitions['any']) {
    allowedTransitions = [...allowedTransitions, ...transitions['any']];
  }
  
  return allowedTransitions;
};

// Global status constants
export const STATUSES = {
  SUBMITTED: 'submitted',
  PENDING_MATCH: 'pending_match',
  DEV_REQUESTED: 'dev_requested',
  AWAITING_CLIENT_APPROVAL: 'awaiting_client_approval',
  APPROVED: 'approved',
  IN_PROGRESS: 'in_progress',
  READY_FOR_QA: 'ready_for_qa',
  QA_FEEDBACK: 'qa_feedback',
  COMPLETE: 'complete',
  CANCELLED_BY_CLIENT: 'cancelled_by_client',
  ABANDONED_BY_DEV: 'abandoned_by_dev'
};
