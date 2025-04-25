
// Define user types for status transitions
import { HELP_REQUEST_STATUSES, normalizeStatus } from './constants/statusConstants';

export type UserType = 'client' | 'developer' | 'system';

// Define valid status transitions (legacy - consider using the new statusTransitions.ts instead)
export const STATUS_TRANSITIONS = {
  system: {
    [HELP_REQUEST_STATUSES.SUBMITTED]: [HELP_REQUEST_STATUSES.PENDING_MATCH],
    [HELP_REQUEST_STATUSES.DEV_REQUESTED]: [HELP_REQUEST_STATUSES.AWAITING_CLIENT_APPROVAL],
    [HELP_REQUEST_STATUSES.QA_PASS]: [HELP_REQUEST_STATUSES.READY_FOR_FINAL_ACTION],
    'any': [HELP_REQUEST_STATUSES.CANCELLED] // Special case handled in validation
  },
  developer: {
    [HELP_REQUEST_STATUSES.PENDING_MATCH]: [HELP_REQUEST_STATUSES.DEV_REQUESTED],
    [HELP_REQUEST_STATUSES.APPROVED]: [HELP_REQUEST_STATUSES.REQUIREMENTS_REVIEW, HELP_REQUEST_STATUSES.NEED_MORE_INFO],
    [HELP_REQUEST_STATUSES.REQUIREMENTS_REVIEW]: [HELP_REQUEST_STATUSES.IN_PROGRESS, HELP_REQUEST_STATUSES.NEED_MORE_INFO],
    [HELP_REQUEST_STATUSES.NEED_MORE_INFO]: [HELP_REQUEST_STATUSES.REQUIREMENTS_REVIEW, HELP_REQUEST_STATUSES.IN_PROGRESS],
    [HELP_REQUEST_STATUSES.IN_PROGRESS]: [HELP_REQUEST_STATUSES.READY_FOR_QA, HELP_REQUEST_STATUSES.REQUIREMENTS_REVIEW, HELP_REQUEST_STATUSES.NEED_MORE_INFO],
    'in-progress': [HELP_REQUEST_STATUSES.READY_FOR_QA, HELP_REQUEST_STATUSES.REQUIREMENTS_REVIEW, HELP_REQUEST_STATUSES.NEED_MORE_INFO], // Added for hyphenated version too
    [HELP_REQUEST_STATUSES.QA_FAIL]: [HELP_REQUEST_STATUSES.IN_PROGRESS, HELP_REQUEST_STATUSES.READY_FOR_QA],
    [HELP_REQUEST_STATUSES.QA_PASS]: [HELP_REQUEST_STATUSES.READY_FOR_FINAL_ACTION],
    [HELP_REQUEST_STATUSES.READY_FOR_FINAL_ACTION]: [HELP_REQUEST_STATUSES.RESOLVED]
  },
  client: {
    [HELP_REQUEST_STATUSES.SUBMITTED]: [HELP_REQUEST_STATUSES.CANCELLED],
    [HELP_REQUEST_STATUSES.PENDING_MATCH]: [HELP_REQUEST_STATUSES.CANCELLED],
    [HELP_REQUEST_STATUSES.DEV_REQUESTED]: [HELP_REQUEST_STATUSES.CANCELLED],
    [HELP_REQUEST_STATUSES.AWAITING_CLIENT_APPROVAL]: [HELP_REQUEST_STATUSES.APPROVED, HELP_REQUEST_STATUSES.PENDING_MATCH, HELP_REQUEST_STATUSES.CANCELLED],
    [HELP_REQUEST_STATUSES.APPROVED]: [HELP_REQUEST_STATUSES.CANCELLED],
    [HELP_REQUEST_STATUSES.REQUIREMENTS_REVIEW]: [HELP_REQUEST_STATUSES.CANCELLED],
    [HELP_REQUEST_STATUSES.NEED_MORE_INFO]: [HELP_REQUEST_STATUSES.CANCELLED, HELP_REQUEST_STATUSES.REQUIREMENTS_REVIEW],
    [HELP_REQUEST_STATUSES.IN_PROGRESS]: [HELP_REQUEST_STATUSES.CANCELLED],
    [HELP_REQUEST_STATUSES.READY_FOR_QA]: [HELP_REQUEST_STATUSES.QA_FAIL, HELP_REQUEST_STATUSES.QA_PASS, HELP_REQUEST_STATUSES.CANCELLED],
    [HELP_REQUEST_STATUSES.QA_FAIL]: [HELP_REQUEST_STATUSES.CANCELLED],
    [HELP_REQUEST_STATUSES.QA_PASS]: [HELP_REQUEST_STATUSES.CANCELLED],
    [HELP_REQUEST_STATUSES.READY_FOR_FINAL_ACTION]: [HELP_REQUEST_STATUSES.RESOLVED, HELP_REQUEST_STATUSES.CANCELLED],
    [HELP_REQUEST_STATUSES.OPEN]: [HELP_REQUEST_STATUSES.CANCELLED], // Added for open tickets
    'any': [HELP_REQUEST_STATUSES.CANCELLED] // Client can cancel anytime
  }
};

// Helper function to check if a status transition is valid
export const isValidStatusTransition = (
  currentStatus: string,
  newStatus: string,
  userType: UserType
): boolean => {
  const transitions = STATUS_TRANSITIONS[userType];
  
  // Special case for cancellation by client
  if (newStatus === HELP_REQUEST_STATUSES.CANCELLED && userType === 'client') {
    return true;
  }
  
  // Handle normalized status formats (for compatibility)
  const normalizedCurrentStatus = normalizeStatus(currentStatus);
  
  // Regular transition check - try direct match first
  let allowedTransitions = transitions[currentStatus];
  
  // If no direct match, try normalized status
  if (!allowedTransitions) {
    allowedTransitions = transitions[normalizedCurrentStatus];
  }
  
  // If still no match, check any special cases
  if (!allowedTransitions && transitions['any']) {
    return transitions['any'].includes(newStatus);
  }
  
  return Array.isArray(allowedTransitions) && allowedTransitions.includes(newStatus);
};

// Get next logical status in the workflow
export const getNextStatus = (currentStatus: string, userType: UserType): string | null => {
  const transitions = STATUS_TRANSITIONS[userType];
  // Handle normalized status formats (for compatibility)
  const normalizedCurrentStatus = normalizeStatus(currentStatus);
  
  // Try direct match first
  let nextStatuses = transitions[currentStatus];
  
  // If no direct match, try normalized status
  if (!nextStatuses) {
    nextStatuses = transitions[normalizedCurrentStatus];
  }
  
  return Array.isArray(nextStatuses) && nextStatuses.length > 0 ? nextStatuses[0] : null;
};

// Get human-readable status label
export const getStatusLabel = (status: string): string => {
  // Normalize status for consistent lookup
  const normalizedStatus = normalizeStatus(status);
  
  const statusLabels: Record<string, string> = {
    [normalizeStatus(HELP_REQUEST_STATUSES.SUBMITTED)]: 'Submitted',
    [normalizeStatus(HELP_REQUEST_STATUSES.PENDING_MATCH)]: 'Pending Match',
    [normalizeStatus(HELP_REQUEST_STATUSES.DEV_REQUESTED)]: 'Developer Requested',
    [normalizeStatus(HELP_REQUEST_STATUSES.AWAITING_CLIENT_APPROVAL)]: 'Awaiting Client Approval',
    [normalizeStatus(HELP_REQUEST_STATUSES.APPROVED)]: 'Approved',
    [normalizeStatus(HELP_REQUEST_STATUSES.REQUIREMENTS_REVIEW)]: 'Requirements Review',
    [normalizeStatus(HELP_REQUEST_STATUSES.NEED_MORE_INFO)]: 'Need More Info',
    [normalizeStatus(HELP_REQUEST_STATUSES.IN_PROGRESS)]: 'In Progress',
    [normalizeStatus(HELP_REQUEST_STATUSES.READY_FOR_QA)]: 'Ready for Client QA',
    [normalizeStatus(HELP_REQUEST_STATUSES.QA_FAIL)]: 'QA Failed',
    [normalizeStatus(HELP_REQUEST_STATUSES.QA_PASS)]: 'QA Passed',
    [normalizeStatus(HELP_REQUEST_STATUSES.READY_FOR_FINAL_ACTION)]: 'Ready for Final Action',
    [normalizeStatus(HELP_REQUEST_STATUSES.RESOLVED)]: 'Resolved',
    [normalizeStatus(HELP_REQUEST_STATUSES.CANCELLED)]: 'Cancelled',
    [normalizeStatus(HELP_REQUEST_STATUSES.OPEN)]: 'Open'
  };

  return statusLabels[normalizedStatus] || status.replace(/_/g, ' ');
};

// Get status descriptions
export const getStatusDescription = (status: string): string => {
  // Normalize status for consistent lookups
  const normalizedStatus = normalizeStatus(status);
  
  const statusDescriptions: Record<string, string> = {
    [normalizeStatus(HELP_REQUEST_STATUSES.SUBMITTED)]: 'Request has been submitted but not yet processed',
    [normalizeStatus(HELP_REQUEST_STATUSES.PENDING_MATCH)]: 'Request is awaiting a developer match',
    [normalizeStatus(HELP_REQUEST_STATUSES.DEV_REQUESTED)]: 'A developer has requested to be assigned',
    [normalizeStatus(HELP_REQUEST_STATUSES.AWAITING_CLIENT_APPROVAL)]: 'Awaiting client approval for developer assignment',
    [normalizeStatus(HELP_REQUEST_STATUSES.APPROVED)]: 'Developer has been approved and can start work',
    [normalizeStatus(HELP_REQUEST_STATUSES.REQUIREMENTS_REVIEW)]: 'Developer is reviewing requirements before starting work',
    [normalizeStatus(HELP_REQUEST_STATUSES.NEED_MORE_INFO)]: 'Developer needs more information to proceed',
    [normalizeStatus(HELP_REQUEST_STATUSES.IN_PROGRESS)]: 'Developer is actively working on this request',
    [normalizeStatus(HELP_REQUEST_STATUSES.READY_FOR_QA)]: 'Developer has completed work and it is ready for client review',
    [normalizeStatus(HELP_REQUEST_STATUSES.QA_FAIL)]: 'Client has reviewed the work and found issues that need fixing',
    [normalizeStatus(HELP_REQUEST_STATUSES.QA_PASS)]: 'Client has confirmed the work meets requirements',
    [normalizeStatus(HELP_REQUEST_STATUSES.READY_FOR_FINAL_ACTION)]: 'Ready for developer to take final actions',
    [normalizeStatus(HELP_REQUEST_STATUSES.RESOLVED)]: 'Request has been completed and resolved successfully',
    [normalizeStatus(HELP_REQUEST_STATUSES.CANCELLED)]: 'Request was cancelled by the client',
    [normalizeStatus(HELP_REQUEST_STATUSES.OPEN)]: 'Request is open and waiting for developer applications'
  };

  return statusDescriptions[normalizedStatus] || 'Status information unavailable';
};

// Global status constants - now using the centralized ones from constants file
export const STATUSES = HELP_REQUEST_STATUSES;

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
  
  // Handle normalized status formats (for compatibility)
  const normalizedCurrentStatus = normalizeStatus(currentStatus);
  
  // Try direct match first
  let allowedTransitions = transitions[currentStatus] || [];
  
  // If no direct match, try normalized status
  if (allowedTransitions.length === 0) {
    allowedTransitions = transitions[normalizedCurrentStatus] || [];
  }
  
  // Add special 'any' transitions if applicable
  if (transitions['any']) {
    allowedTransitions = [...allowedTransitions, ...transitions['any']];
  }
  
  return allowedTransitions;
};
