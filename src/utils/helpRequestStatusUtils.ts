
// Define valid status transitions
export const STATUS_TRANSITIONS = {
  system: {
    'submitted': ['pending_match'],
    'dev_requested': ['awaiting_client_approval'],
    'any': ['cancelled_by_client'] // Special case handled in validation
  },
  developer: {
    'pending_match': ['dev_requested'],
    'approved': ['requirements_review', 'need_more_info'],
    'requirements_review': ['in_progress', 'need_more_info'],
    'need_more_info': ['requirements_review', 'in_progress'],
    'in_progress': ['ready_for_client_qa', 'requirements_review', 'need_more_info'], // Added 'need_more_info' here
    'in-progress': ['ready_for_client_qa', 'requirements_review', 'need_more_info'], // Added for hyphenated version too
    'qa_fail': ['in_progress', 'ready_for_client_qa'],
    'qa_pass': ['ready_for_final_action'],
    'ready_for_final_action': ['resolved']
  },
  client: {
    'submitted': ['cancelled_by_client'],
    'pending_match': ['cancelled_by_client'],
    'dev_requested': ['cancelled_by_client'],
    'awaiting_client_approval': ['approved', 'pending_match', 'cancelled_by_client'], // Can reject back to pending
    'approved': ['cancelled_by_client'],
    'requirements_review': ['cancelled_by_client'],
    'need_more_info': ['cancelled_by_client'],
    'in_progress': ['cancelled_by_client'],
    'ready_for_client_qa': ['qa_fail', 'qa_pass', 'cancelled_by_client'],
    'qa_fail': ['cancelled_by_client'],
    'qa_pass': ['ready_for_final_action', 'cancelled_by_client'],
    'ready_for_final_action': ['resolved', 'cancelled_by_client'],
    'any': ['cancelled_by_client'] // Client can cancel anytime
  }
};

export type UserType = 'client' | 'developer' | 'system';

// Helper function to check if a status transition is valid
export const isValidStatusTransition = (
  currentStatus: string,
  newStatus: string,
  userType: UserType
): boolean => {
  const transitions = STATUS_TRANSITIONS[userType];
  
  // Special case for cancellation by client
  if (newStatus === 'cancelled_by_client' && userType === 'client') {
    return true;
  }
  
  // Handle hyphenated statuses (for compatibility)
  const normalizedCurrentStatus = currentStatus.replace(/-/g, '_');
  
  // Regular transition check
  const allowedTransitions = transitions[normalizedCurrentStatus] || transitions[currentStatus];
  return Array.isArray(allowedTransitions) && allowedTransitions.includes(newStatus);
};

// Get next logical status in the workflow
export const getNextStatus = (currentStatus: string, userType: UserType): string | null => {
  const transitions = STATUS_TRANSITIONS[userType];
  // Handle hyphenated statuses (for compatibility)
  const normalizedCurrentStatus = currentStatus.replace(/-/g, '_');
  const nextStatuses = transitions[normalizedCurrentStatus] || transitions[currentStatus];
  return Array.isArray(nextStatuses) && nextStatuses.length > 0 ? nextStatuses[0] : null;
};

// Get human-readable status label
export const getStatusLabel = (status: string): string => {
  // Handle hyphenated statuses (for compatibility)
  const normalizedStatus = status.replace(/-/g, '_');
  
  const statusLabels: Record<string, string> = {
    'submitted': 'Submitted',
    'pending_match': 'Pending Match',
    'dev_requested': 'Developer Requested',
    'awaiting_client_approval': 'Awaiting Client Approval',
    'approved': 'Approved',
    'requirements_review': 'Requirements Review',
    'need_more_info': 'Need More Info',
    'in_progress': 'In Progress',
    'in-progress': 'In Progress', // Add the hyphenated version
    'ready_for_client_qa': 'Ready for Client QA',
    'qa_fail': 'QA Failed',
    'qa_pass': 'QA Passed',
    'ready_for_final_action': 'Ready for Final Action',
    'resolved': 'Resolved',
    'cancelled_by_client': 'Cancelled'
  };

  return statusLabels[normalizedStatus] || status;
};

// Get status descriptions
export const getStatusDescription = (status: string): string => {
  // Normalize status for consistent lookups
  const normalizedStatus = status.replace(/-/g, '_');
  
  const statusDescriptions: Record<string, string> = {
    'submitted': 'Request has been submitted but not yet processed',
    'pending_match': 'Request is awaiting a developer match',
    'dev_requested': 'A developer has requested to be assigned',
    'awaiting_client_approval': 'Awaiting client approval for developer assignment',
    'approved': 'Developer has been approved and can start work',
    'requirements_review': 'Developer is reviewing requirements before starting work',
    'need_more_info': 'Developer needs more information to proceed',
    'in_progress': 'Developer is actively working on this request',
    'ready_for_client_qa': 'Developer has completed work and it is ready for client review',
    'qa_fail': 'Client has reviewed the work and found issues that need fixing',
    'qa_pass': 'Client has confirmed the work meets requirements',
    'ready_for_final_action': 'Ready for developer to take final actions',
    'resolved': 'Request has been completed and resolved successfully',
    'cancelled_by_client': 'Request was cancelled by the client'
  };

  return statusDescriptions[normalizedStatus] || 'Status information unavailable';
};

// Global status constants
export const STATUSES = {
  SUBMITTED: 'submitted',
  PENDING_MATCH: 'pending_match',
  DEV_REQUESTED: 'dev_requested',
  AWAITING_CLIENT_APPROVAL: 'awaiting_client_approval',
  APPROVED: 'approved',
  REQUIREMENTS_REVIEW: 'requirements_review',
  NEED_MORE_INFO: 'need_more_info',
  IN_PROGRESS: 'in_progress',
  READY_FOR_CLIENT_QA: 'ready_for_client_qa',
  QA_FAIL: 'qa_fail',
  QA_PASS: 'qa_pass',
  READY_FOR_FINAL_ACTION: 'ready_for_final_action',
  RESOLVED: 'resolved',
  CANCELLED_BY_CLIENT: 'cancelled_by_client'
};

// Helper function to check if the current user can update to a given status
export const canUpdateToStatus = (
  currentStatus: string,
  newStatus: string,
  userType: UserType
): boolean => {
  return isValidStatusTransition(currentStatus, newStatus, userType);
};

// Get allowed status transitions based on current status and user type
export const getAllowedStatusTransitions = (
  currentStatus: string,
  userType: UserType
): string[] => {
  if (!currentStatus) return [];
  
  const transitions = STATUS_TRANSITIONS[userType];
  
  // Handle hyphenated statuses (for compatibility)
  const normalizedCurrentStatus = currentStatus.replace(/-/g, '_');
  
  let allowedTransitions = transitions[normalizedCurrentStatus] || transitions[currentStatus] || [];
  
  // Add special 'any' transitions if applicable
  if (transitions['any']) {
    allowedTransitions = [...allowedTransitions, ...transitions['any']];
  }
  
  return allowedTransitions;
};
