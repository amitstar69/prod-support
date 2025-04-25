
import { UserType } from "./helpRequestStatusUtils";
import { HELP_REQUEST_STATUSES, normalizeStatus, HelpRequestStatus } from "./constants/statusConstants";

/**
 * Represents a valid status transition
 */
export interface StatusTransition {
  from: string;
  to: string;
  roles: string[];
  buttonLabel?: string;
  buttonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  description?: string;
}

/**
 * Check if a status transition is valid
 */
export const isValidTransition = (
  currentStatus: string, 
  newStatus: string, 
  userType: UserType
): boolean => {
  // Normalize status values for consistent comparison
  const normalizedCurrentStatus = normalizeStatus(currentStatus);
  const normalizedNewStatus = normalizeStatus(newStatus);
  
  // Special case: client can cancel anytime
  if (userType === 'client' && normalizedNewStatus === normalizeStatus(HELP_REQUEST_STATUSES.CANCELLED_BY_CLIENT)) {
    return true;
  }

  // Get the allowed transitions for this status and user type
  const transitions = getTransitionsForStatus(normalizedCurrentStatus, userType);
  
  // Check if the new status is in the allowed transitions
  return transitions.some(t => normalizeStatus(t.to) === normalizedNewStatus);
};

/**
 * Get all possible transitions from a current status for a specific user type
 */
export const getAllowedTransitions = (currentStatus: string, userType: UserType): StatusTransition[] => {
  // Normalize status value for consistent comparison
  const normalizedStatus = normalizeStatus(currentStatus);
  
  // Special handling for the cancel action which is always available for clients
  const transitions = getTransitionsForStatus(normalizedStatus, userType);
  
  if (userType === 'client' && !transitions.some(t => normalizeStatus(t.to) === normalizeStatus(HELP_REQUEST_STATUSES.CANCELLED_BY_CLIENT))) {
    // Add cancellation as an option for clients if not already included
    transitions.push({
      from: normalizedStatus,
      to: HELP_REQUEST_STATUSES.CANCELLED_BY_CLIENT,
      roles: ['client'],
      buttonLabel: 'Cancel Request',
      buttonVariant: 'destructive',
      description: 'Cancel this help request'
    });
  }
  
  return transitions;
};

/**
 * Get the recommended next status based on the current workflow
 */
export const getNextRecommendedStatus = (
  currentStatus: string,
  userType: UserType
): string | null => {
  // Get all transitions and return the first one, or null if none available
  const transitions = getAllowedTransitions(currentStatus, userType);
  return transitions.length > 0 ? transitions[0].to : null;
};

/**
 * Get base transitions for a specific status and user type
 */
const getTransitionsForStatus = (status: string, userType: UserType): StatusTransition[] => {
  // Define all possible transitions using the constants for consistency
  const allTransitions: StatusTransition[] = [
    // Client transitions
    { from: HELP_REQUEST_STATUSES.SUBMITTED, to: HELP_REQUEST_STATUSES.PENDING_MATCH, roles: ['system'], buttonLabel: 'Send to Matching', buttonVariant: 'default' },
    { from: HELP_REQUEST_STATUSES.PENDING_MATCH, to: HELP_REQUEST_STATUSES.DEV_REQUESTED, roles: ['developer'], buttonLabel: 'Request Assignment', buttonVariant: 'default' },
    { from: HELP_REQUEST_STATUSES.DEV_REQUESTED, to: HELP_REQUEST_STATUSES.AWAITING_CLIENT_APPROVAL, roles: ['system'], buttonLabel: 'Notify Client', buttonVariant: 'default' },
    { from: HELP_REQUEST_STATUSES.AWAITING_CLIENT_APPROVAL, to: HELP_REQUEST_STATUSES.APPROVED, roles: ['client'], buttonLabel: 'Approve Developer', buttonVariant: 'default' },
    { from: HELP_REQUEST_STATUSES.AWAITING_CLIENT_APPROVAL, to: HELP_REQUEST_STATUSES.PENDING_MATCH, roles: ['client'], buttonLabel: 'Reject & Find Another', buttonVariant: 'outline' },
    { from: HELP_REQUEST_STATUSES.APPROVED, to: HELP_REQUEST_STATUSES.REQUIREMENTS_REVIEW, roles: ['developer'], buttonLabel: 'Start Requirements Review', buttonVariant: 'default' },
    { from: HELP_REQUEST_STATUSES.APPROVED, to: HELP_REQUEST_STATUSES.NEED_MORE_INFO, roles: ['developer'], buttonLabel: 'Request More Information', buttonVariant: 'outline' },
    { from: HELP_REQUEST_STATUSES.REQUIREMENTS_REVIEW, to: HELP_REQUEST_STATUSES.IN_PROGRESS, roles: ['developer'], buttonLabel: 'Start Work', buttonVariant: 'default' },
    { from: HELP_REQUEST_STATUSES.REQUIREMENTS_REVIEW, to: HELP_REQUEST_STATUSES.NEED_MORE_INFO, roles: ['developer'], buttonLabel: 'Request More Information', buttonVariant: 'outline' },
    { from: HELP_REQUEST_STATUSES.NEED_MORE_INFO, to: HELP_REQUEST_STATUSES.REQUIREMENTS_REVIEW, roles: ['client', 'developer'], buttonLabel: 'Back to Requirements', buttonVariant: 'outline' },
    { from: HELP_REQUEST_STATUSES.IN_PROGRESS, to: HELP_REQUEST_STATUSES.READY_FOR_QA, roles: ['developer'], buttonLabel: 'Ready for QA', buttonVariant: 'default' },
    { from: HELP_REQUEST_STATUSES.READY_FOR_QA, to: HELP_REQUEST_STATUSES.QA_FAIL, roles: ['client'], buttonLabel: 'Request Changes', buttonVariant: 'destructive' },
    { from: HELP_REQUEST_STATUSES.READY_FOR_QA, to: HELP_REQUEST_STATUSES.QA_PASS, roles: ['client'], buttonLabel: 'Approve Work', buttonVariant: 'default' },
    { from: HELP_REQUEST_STATUSES.QA_FAIL, to: HELP_REQUEST_STATUSES.IN_PROGRESS, roles: ['developer'], buttonLabel: 'Resume Work', buttonVariant: 'default' },
    { from: HELP_REQUEST_STATUSES.QA_FAIL, to: HELP_REQUEST_STATUSES.READY_FOR_QA, roles: ['developer'], buttonLabel: 'Ready for QA Again', buttonVariant: 'outline' },
    { from: HELP_REQUEST_STATUSES.QA_PASS, to: HELP_REQUEST_STATUSES.READY_FOR_FINAL_ACTION, roles: ['system'], buttonLabel: 'Finalize', buttonVariant: 'default' },
    { from: HELP_REQUEST_STATUSES.READY_FOR_FINAL_ACTION, to: HELP_REQUEST_STATUSES.RESOLVED, roles: ['client', 'developer'], buttonLabel: 'Mark as Resolved', buttonVariant: 'default' },
    
    // Cancel option (available to clients at various stages)
    { from: HELP_REQUEST_STATUSES.SUBMITTED, to: HELP_REQUEST_STATUSES.CANCELLED_BY_CLIENT, roles: ['client'], buttonLabel: 'Cancel Request', buttonVariant: 'destructive' },
    { from: HELP_REQUEST_STATUSES.PENDING_MATCH, to: HELP_REQUEST_STATUSES.CANCELLED_BY_CLIENT, roles: ['client'], buttonLabel: 'Cancel Request', buttonVariant: 'destructive' },
    { from: HELP_REQUEST_STATUSES.DEV_REQUESTED, to: HELP_REQUEST_STATUSES.CANCELLED_BY_CLIENT, roles: ['client'], buttonLabel: 'Cancel Request', buttonVariant: 'destructive' },
    { from: HELP_REQUEST_STATUSES.AWAITING_CLIENT_APPROVAL, to: HELP_REQUEST_STATUSES.CANCELLED_BY_CLIENT, roles: ['client'], buttonLabel: 'Cancel Request', buttonVariant: 'destructive' },
    { from: HELP_REQUEST_STATUSES.APPROVED, to: HELP_REQUEST_STATUSES.CANCELLED_BY_CLIENT, roles: ['client'], buttonLabel: 'Cancel Request', buttonVariant: 'destructive' },
    { from: HELP_REQUEST_STATUSES.REQUIREMENTS_REVIEW, to: HELP_REQUEST_STATUSES.CANCELLED_BY_CLIENT, roles: ['client'], buttonLabel: 'Cancel Request', buttonVariant: 'destructive' },
    { from: HELP_REQUEST_STATUSES.NEED_MORE_INFO, to: HELP_REQUEST_STATUSES.CANCELLED_BY_CLIENT, roles: ['client'], buttonLabel: 'Cancel Request', buttonVariant: 'destructive' },
    { from: HELP_REQUEST_STATUSES.IN_PROGRESS, to: HELP_REQUEST_STATUSES.CANCELLED_BY_CLIENT, roles: ['client'], buttonLabel: 'Cancel Request', buttonVariant: 'destructive' },
    { from: HELP_REQUEST_STATUSES.OPEN, to: HELP_REQUEST_STATUSES.CANCELLED_BY_CLIENT, roles: ['client'], buttonLabel: 'Cancel Request', buttonVariant: 'destructive' }
  ];
  
  // Filter transitions based on current status and user role
  return allTransitions.filter(t => 
    normalizeStatus(t.from) === normalizeStatus(status) && t.roles.includes(userType)
  );
};
