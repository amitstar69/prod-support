
/**
 * Centralized status constants to ensure consistency across the application
 */

// Define all valid help request statuses
export const HELP_REQUEST_STATUSES = {
  SUBMITTED: 'submitted',
  PENDING_MATCH: 'pending_match',
  DEV_REQUESTED: 'dev_requested',
  AWAITING_CLIENT_APPROVAL: 'awaiting_client_approval',
  PENDING_DEVELOPER_APPROVAL: 'pending_developer_approval',
  APPROVED: 'approved',
  REQUIREMENTS_REVIEW: 'requirements_review',
  NEED_MORE_INFO: 'need_more_info',
  IN_PROGRESS: 'in_progress',
  READY_FOR_QA: 'ready_for_qa',
  READY_FOR_CLIENT_QA: 'ready_for_client_qa', 
  QA_FAIL: 'qa_fail',
  QA_PASS: 'qa_pass',
  READY_FOR_FINAL_ACTION: 'ready_for_final_action',
  RESOLVED: 'resolved',
  CANCELLED: 'cancelled', // Changed from CANCELLED_BY_CLIENT to match database constraint
  OPEN: 'open'
} as const;

// Create a type from the values
export type HelpRequestStatus = typeof HELP_REQUEST_STATUSES[keyof typeof HELP_REQUEST_STATUSES];

// Define match status constants
export const MATCH_STATUSES = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  ABANDONED_BY_DEV: 'abandoned_by_dev'
} as const;

export type MatchStatus = typeof MATCH_STATUSES[keyof typeof MATCH_STATUSES];

/**
 * Get a normalized status string with consistent format (using underscores)
 * @param status Status string which might have inconsistent format
 */
export const normalizeStatus = (status: string): string => {
  return status.replace(/[-\s]/g, '_').toLowerCase();
};

/**
 * Convert normalized status (with underscores) to display format
 * @param status Normalized status string
 */
export const formatStatusForDisplay = (status: string): string => {
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Utility to check if a string is a valid help request status
 */
export const isValidHelpRequestStatus = (status: string): boolean => {
  const normalizedStatus = normalizeStatus(status);
  return Object.values(HELP_REQUEST_STATUSES)
    .map(s => normalizeStatus(s))
    .includes(normalizedStatus);
};
