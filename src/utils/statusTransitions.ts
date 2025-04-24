
import { UserType } from "./helpRequestStatusUtils";

/**
 * Type definitions for the status transition system
 */
export type StatusTransition = {
  from: string;
  to: string;
  allowedRoles: Array<UserType | 'system'>;
  label?: string;
  description?: string;
  buttonLabel?: string;
  buttonVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
};

/**
 * Comprehensive mapping of status transitions with metadata
 */
export const STATUS_TRANSITIONS: StatusTransition[] = [
  // Client submission flow
  {
    from: 'submitted',
    to: 'pending_match',
    allowedRoles: ['system'],
    description: 'System automatically transitions to matching phase'
  },
  
  // Developer application flow
  {
    from: 'pending_match',
    to: 'dev_requested',
    allowedRoles: ['developer'],
    label: 'Request Assignment',
    description: 'Developer requests to be assigned to this request',
    buttonLabel: 'Request Assignment',
    buttonVariant: 'default'
  },
  {
    from: 'dev_requested', 
    to: 'awaiting_client_approval',
    allowedRoles: ['system'],
    description: 'System automatically transitions to await client approval'
  },
  
  // Client approval flow
  {
    from: 'awaiting_client_approval',
    to: 'approved',
    allowedRoles: ['client'],
    label: 'Approve Developer',
    description: 'Client approves the developer for this request',
    buttonLabel: 'Approve Developer',
    buttonVariant: 'default'
  },
  {
    from: 'awaiting_client_approval',
    to: 'pending_match',
    allowedRoles: ['client'],
    label: 'Reject Developer',
    description: 'Client rejects the developer and returns to matching phase',
    buttonLabel: 'Reject Developer',
    buttonVariant: 'secondary'
  },
  
  // Developer workflow
  {
    from: 'approved',
    to: 'requirements_review',
    allowedRoles: ['developer'],
    label: 'Start Requirements Review',
    description: 'Developer begins reviewing requirements',
    buttonLabel: 'Start Review',
    buttonVariant: 'default'
  },
  {
    from: 'requirements_review',
    to: 'in_progress',
    allowedRoles: ['developer'],
    label: 'Begin Implementation',
    description: 'Developer begins implementing the solution',
    buttonLabel: 'Begin Implementation',
    buttonVariant: 'default'
  },
  {
    from: 'requirements_review',
    to: 'need_more_info',
    allowedRoles: ['developer'],
    label: 'Request More Information',
    description: 'Developer needs more information from the client',
    buttonLabel: 'Request More Info',
    buttonVariant: 'outline'
  },
  {
    from: 'need_more_info',
    to: 'requirements_review',
    allowedRoles: ['developer', 'client'],
    label: 'Continue Review',
    description: 'Return to requirements review after getting more information',
    buttonLabel: 'Continue Review',
    buttonVariant: 'default'
  },
  {
    from: 'in_progress',
    to: 'ready_for_qa',
    allowedRoles: ['developer'],
    label: 'Submit for QA',
    description: 'Developer has completed work and submits for client review',
    buttonLabel: 'Submit for QA',
    buttonVariant: 'default'
  },
  {
    from: 'in_progress',
    to: 'need_more_info',
    allowedRoles: ['developer'],
    label: 'Request More Information',
    description: 'Developer needs more information during implementation',
    buttonLabel: 'Request More Info',
    buttonVariant: 'outline'
  },
  
  // QA flow
  {
    from: 'ready_for_qa',
    to: 'qa_fail',
    allowedRoles: ['client'],
    label: 'Fail QA',
    description: 'Client found issues during QA',
    buttonLabel: 'Request Changes',
    buttonVariant: 'secondary'
  },
  {
    from: 'ready_for_qa',
    to: 'qa_pass',
    allowedRoles: ['client'],
    label: 'Pass QA',
    description: 'Client approves the work during QA',
    buttonLabel: 'Approve Work',
    buttonVariant: 'default'
  },
  {
    from: 'qa_fail',
    to: 'in_progress',
    allowedRoles: ['developer'],
    label: 'Resume Work',
    description: 'Developer resumes work after QA feedback',
    buttonLabel: 'Resume Work',
    buttonVariant: 'default'
  },
  {
    from: 'qa_pass',
    to: 'ready_for_final_action',
    allowedRoles: ['system'],
    description: 'System automatically transitions to final action phase'
  },
  {
    from: 'ready_for_final_action',
    to: 'resolved',
    allowedRoles: ['developer'],
    label: 'Mark Resolved',
    description: 'Developer marks the request as resolved after final actions',
    buttonLabel: 'Mark Resolved',
    buttonVariant: 'default'
  },
  // Client can also mark a request as resolved at this stage
  {
    from: 'ready_for_final_action',
    to: 'resolved',
    allowedRoles: ['client'],
    label: 'Confirm Resolution',
    description: 'Client confirms the request is resolved',
    buttonLabel: 'Confirm Resolution',
    buttonVariant: 'default'
  },
  // Add status transitions for open tickets
  {
    from: 'open',
    to: 'cancelled_by_client',
    allowedRoles: ['client'],
    label: 'Cancel Request',
    description: 'Cancel this help request',
    buttonLabel: 'Cancel Request',
    buttonVariant: 'destructive'
  },
  {
    from: 'pending_match',
    to: 'cancelled_by_client',
    allowedRoles: ['client'],
    label: 'Cancel Request',
    description: 'Cancel this help request',
    buttonLabel: 'Cancel Request',
    buttonVariant: 'destructive'
  },
];

// Add cancellation options for all statuses
const CANCELLABLE_STATUSES = [
  'submitted', 'pending_match', 'dev_requested', 'awaiting_client_approval',
  'approved', 'requirements_review', 'need_more_info', 'in_progress',
  'ready_for_qa', 'qa_fail', 'qa_pass', 'ready_for_final_action'
];

// Add cancellation transitions for the client role
CANCELLABLE_STATUSES.forEach(status => {
  // Don't add duplicate cancellation transitions
  if (status !== 'open' && status !== 'pending_match') {
    STATUS_TRANSITIONS.push({
      from: status,
      to: 'cancelled_by_client',
      allowedRoles: ['client'],
      label: 'Cancel Request',
      description: 'Client cancels the request',
      buttonLabel: 'Cancel Request',
      buttonVariant: 'destructive'
    });
  }
});

/**
 * Get all allowed transitions from a given status for a specific user type
 */
export const getAllowedTransitions = (
  currentStatus: string, 
  userType: UserType | 'system'
): StatusTransition[] => {
  // Normalize the status by replacing hyphens with underscores
  const normalizedStatus = currentStatus.replace(/-/g, '_');
  
  return STATUS_TRANSITIONS.filter(
    transition => transition.from === normalizedStatus && 
                 transition.allowedRoles.includes(userType)
  );
};

/**
 * Get the recommended next status for a given current status and user type
 */
export const getNextRecommendedStatus = (
  currentStatus: string,
  userType: UserType | 'system'
): string | null => {
  const transitions = getAllowedTransitions(currentStatus, userType);
  
  // Filter out cancellation options for primary recommendation
  const primaryTransitions = transitions.filter(t => t.to !== 'cancelled_by_client');
  
  if (primaryTransitions.length > 0) {
    return primaryTransitions[0].to;
  }
  
  return transitions.length > 0 ? transitions[0].to : null;
};

/**
 * Validate if a status transition is allowed
 */
export const isValidTransition = (
  fromStatus: string,
  toStatus: string,
  userType: UserType | 'system'
): boolean => {
  // Normalize statuses by replacing hyphens with underscores
  const normalizedFromStatus = fromStatus.replace(/-/g, '_');
  const normalizedToStatus = toStatus.replace(/-/g, '_');
  
  return STATUS_TRANSITIONS.some(
    transition => 
      transition.from === normalizedFromStatus &&
      transition.to === normalizedToStatus &&
      transition.allowedRoles.includes(userType)
  );
};

/**
 * Get transition metadata for a specific transition
 */
export const getTransitionMetadata = (
  fromStatus: string,
  toStatus: string
): StatusTransition | undefined => {
  // Normalize statuses by replacing hyphens with underscores
  const normalizedFromStatus = fromStatus.replace(/-/g, '_');
  const normalizedToStatus = toStatus.replace(/-/g, '_');
  
  return STATUS_TRANSITIONS.find(
    transition => transition.from === normalizedFromStatus && transition.to === normalizedToStatus
  );
};
