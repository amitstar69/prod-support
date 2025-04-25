
import { UserType } from "./helpRequestStatusUtils";

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
  // Normalize status values
  const normalizedCurrentStatus = currentStatus.replace(/[-_]/g, '_');
  const normalizedNewStatus = newStatus.replace(/[-_]/g, '_');
  
  // Special case: client can cancel anytime
  if (userType === 'client' && normalizedNewStatus === 'cancelled_by_client') {
    return true;
  }

  // Get the allowed transitions for this status and user type
  const transitions = getTransitionsForStatus(normalizedCurrentStatus, userType);
  
  // Check if the new status is in the allowed transitions
  return transitions.some(t => t.to === normalizedNewStatus);
};

/**
 * Get all possible transitions from a current status for a specific user type
 */
export const getAllowedTransitions = (currentStatus: string, userType: UserType): StatusTransition[] => {
  // Normalize status value
  const normalizedStatus = currentStatus.replace(/[-_]/g, '_');
  
  // Special handling for the cancel action which is always available for clients
  const transitions = getTransitionsForStatus(normalizedStatus, userType);
  
  if (userType === 'client' && !transitions.some(t => t.to === 'cancelled_by_client')) {
    // Add cancellation as an option for clients if not already included
    transitions.push({
      from: normalizedStatus,
      to: 'cancelled_by_client',
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
  // Define all possible transitions
  const allTransitions: StatusTransition[] = [
    // Client transitions
    { from: 'submitted', to: 'pending_match', roles: ['system'], buttonLabel: 'Send to Matching', buttonVariant: 'default' },
    { from: 'pending_match', to: 'dev_requested', roles: ['developer'], buttonLabel: 'Request Assignment', buttonVariant: 'default' },
    { from: 'dev_requested', to: 'awaiting_client_approval', roles: ['system'], buttonLabel: 'Notify Client', buttonVariant: 'default' },
    { from: 'awaiting_client_approval', to: 'approved', roles: ['client'], buttonLabel: 'Approve Developer', buttonVariant: 'default' },
    { from: 'awaiting_client_approval', to: 'pending_match', roles: ['client'], buttonLabel: 'Reject & Find Another', buttonVariant: 'outline' },
    { from: 'approved', to: 'requirements_review', roles: ['developer'], buttonLabel: 'Start Requirements Review', buttonVariant: 'default' },
    { from: 'approved', to: 'need_more_info', roles: ['developer'], buttonLabel: 'Request More Information', buttonVariant: 'outline' },
    { from: 'requirements_review', to: 'in_progress', roles: ['developer'], buttonLabel: 'Start Work', buttonVariant: 'default' },
    { from: 'requirements_review', to: 'need_more_info', roles: ['developer'], buttonLabel: 'Request More Information', buttonVariant: 'outline' },
    { from: 'need_more_info', to: 'requirements_review', roles: ['client', 'developer'], buttonLabel: 'Back to Requirements', buttonVariant: 'outline' },
    { from: 'in_progress', to: 'ready_for_qa', roles: ['developer'], buttonLabel: 'Ready for QA', buttonVariant: 'default' },
    { from: 'ready_for_qa', to: 'qa_fail', roles: ['client'], buttonLabel: 'Request Changes', buttonVariant: 'destructive' },
    { from: 'ready_for_qa', to: 'qa_pass', roles: ['client'], buttonLabel: 'Approve Work', buttonVariant: 'default' },
    { from: 'qa_fail', to: 'in_progress', roles: ['developer'], buttonLabel: 'Resume Work', buttonVariant: 'default' },
    { from: 'qa_fail', to: 'ready_for_qa', roles: ['developer'], buttonLabel: 'Ready for QA Again', buttonVariant: 'outline' },
    { from: 'qa_pass', to: 'ready_for_final_action', roles: ['system'], buttonLabel: 'Finalize', buttonVariant: 'default' },
    { from: 'ready_for_final_action', to: 'resolved', roles: ['client', 'developer'], buttonLabel: 'Mark as Resolved', buttonVariant: 'default' },
    
    // Cancel option (available to clients at various stages)
    { from: 'submitted', to: 'cancelled_by_client', roles: ['client'], buttonLabel: 'Cancel Request', buttonVariant: 'destructive' },
    { from: 'pending_match', to: 'cancelled_by_client', roles: ['client'], buttonLabel: 'Cancel Request', buttonVariant: 'destructive' },
    { from: 'dev_requested', to: 'cancelled_by_client', roles: ['client'], buttonLabel: 'Cancel Request', buttonVariant: 'destructive' },
    { from: 'awaiting_client_approval', to: 'cancelled_by_client', roles: ['client'], buttonLabel: 'Cancel Request', buttonVariant: 'destructive' },
    { from: 'approved', to: 'cancelled_by_client', roles: ['client'], buttonLabel: 'Cancel Request', buttonVariant: 'destructive' },
    { from: 'requirements_review', to: 'cancelled_by_client', roles: ['client'], buttonLabel: 'Cancel Request', buttonVariant: 'destructive' },
    { from: 'need_more_info', to: 'cancelled_by_client', roles: ['client'], buttonLabel: 'Cancel Request', buttonVariant: 'destructive' },
    { from: 'in_progress', to: 'cancelled_by_client', roles: ['client'], buttonLabel: 'Cancel Request', buttonVariant: 'destructive' },
    { from: 'open', to: 'cancelled_by_client', roles: ['client'], buttonLabel: 'Cancel Request', buttonVariant: 'destructive' }
  ];
  
  // Filter transitions based on current status and user role
  return allTransitions.filter(t => 
    t.from === status && t.roles.includes(userType)
  );
};
