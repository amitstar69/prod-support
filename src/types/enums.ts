
/**
 * Enum for ticket status values
 */
export enum TicketStatus {
  Open = 'open',
  Accepted = 'accepted',
  InProgress = 'in_progress',
  NeedsInfo = 'needs_info',
  Completed = 'completed',
  Closed = 'closed',
  PendingReview = 'pending_review',
  PendingMatch = 'pending_match',
  DevRequested = 'dev_requested',
  AwaitingClientApproval = 'awaiting_client_approval',
  RequirementsReview = 'requirements_review',
  NeedMoreInfo = 'need_more_info',
  ReadyForQA = 'ready_for_qa',
  ReadyForClientQA = 'ready_for_client_qa',
  QAFail = 'qa_fail',
  QAPass = 'qa_pass',
  ReadyForFinalAction = 'ready_for_final_action',
  Resolved = 'resolved',
  Cancelled = 'cancelled'
}

/**
 * Enum for application match statuses
 */
export enum MatchStatus {
  Pending = 'pending',
  Approved = 'approved',
  ApprovedByClient = 'approved_by_client',
  Rejected = 'rejected',
  RejectedByClient = 'rejected_by_client',
  Completed = 'completed',
  Cancelled = 'cancelled'
}

/**
 * User type enum
 */
export type UserType = 'client' | 'developer' | 'system';
