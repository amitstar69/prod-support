
import { HELP_REQUEST_STATUSES } from './constants/statusConstants';
import { UserType } from './helpRequestStatusUtils';

/**
 * Defines a status transition with metadata
 */
export interface StatusTransition {
  from: string;
  to: string;
  buttonLabel?: string;
  buttonVariant?: "default" | "secondary" | "destructive" | "outline";
  requiresComment?: boolean;
  userTypes: UserType[];
}

/**
 * Get all allowed transitions for the current status and user type
 */
export const getAllowedTransitions = (currentStatus: string, userType: UserType): StatusTransition[] => {
  const allTransitions: StatusTransition[] = [
    // Client transitions
    {
      from: HELP_REQUEST_STATUSES.AWAITING_CLIENT_APPROVAL,
      to: HELP_REQUEST_STATUSES.APPROVED,
      buttonLabel: 'Approve Developer',
      buttonVariant: 'default',
      userTypes: ['client']
    },
    {
      from: HELP_REQUEST_STATUSES.AWAITING_CLIENT_APPROVAL,
      to: HELP_REQUEST_STATUSES.CANCELLED,
      buttonLabel: 'Reject & Cancel Request',
      buttonVariant: 'destructive',
      requiresComment: true,
      userTypes: ['client']
    },
    {
      from: HELP_REQUEST_STATUSES.READY_FOR_QA,
      to: HELP_REQUEST_STATUSES.QA_PASS,
      buttonLabel: 'Approve Work',
      buttonVariant: 'default',
      userTypes: ['client']
    },
    {
      from: HELP_REQUEST_STATUSES.READY_FOR_QA,
      to: HELP_REQUEST_STATUSES.QA_FAIL,
      buttonLabel: 'Request Changes',
      buttonVariant: 'secondary',
      requiresComment: true,
      userTypes: ['client']
    },
    {
      from: HELP_REQUEST_STATUSES.QA_PASS,
      to: HELP_REQUEST_STATUSES.RESOLVED,
      buttonLabel: 'Mark as Complete',
      buttonVariant: 'default',
      userTypes: ['client']
    },
    
    // Developer transitions
    {
      from: HELP_REQUEST_STATUSES.APPROVED,
      to: HELP_REQUEST_STATUSES.REQUIREMENTS_REVIEW,
      buttonLabel: 'Start Requirements Review',
      userTypes: ['developer']
    },
    {
      from: HELP_REQUEST_STATUSES.APPROVED,
      to: HELP_REQUEST_STATUSES.NEED_MORE_INFO,
      buttonLabel: 'Request More Information',
      requiresComment: true,
      userTypes: ['developer']
    },
    {
      from: HELP_REQUEST_STATUSES.REQUIREMENTS_REVIEW,
      to: HELP_REQUEST_STATUSES.IN_PROGRESS,
      buttonLabel: 'Start Development',
      userTypes: ['developer']
    },
    {
      from: HELP_REQUEST_STATUSES.NEED_MORE_INFO,
      to: HELP_REQUEST_STATUSES.REQUIREMENTS_REVIEW,
      buttonLabel: 'Continue with Review',
      userTypes: ['developer']
    },
    {
      from: HELP_REQUEST_STATUSES.IN_PROGRESS,
      to: HELP_REQUEST_STATUSES.READY_FOR_QA,
      buttonLabel: 'Submit for Review',
      userTypes: ['developer']
    },
    {
      from: HELP_REQUEST_STATUSES.QA_FAIL,
      to: HELP_REQUEST_STATUSES.IN_PROGRESS,
      buttonLabel: 'Resume Development',
      userTypes: ['developer']
    }
  ];

  // Return all transitions that match the current status and user type
  return allTransitions.filter(
    transition => 
      transition.from === currentStatus && 
      transition.userTypes.includes(userType)
  );
};

/**
 * Get the next recommended status based on the current status and user role
 */
export const getNextRecommendedStatus = (
  currentStatus: string,
  userType: UserType
): string | null => {
  const transitions = getAllowedTransitions(currentStatus, userType);
  return transitions.length > 0 ? transitions[0].to : null;
};
