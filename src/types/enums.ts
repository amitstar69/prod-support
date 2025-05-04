
/**
 * Enum for ticket status values
 */
export enum TicketStatus {
  Open = 'open',
  InProgress = 'in_progress',
  AwaitingClientApproval = 'awaiting_client_approval',
  Approved = 'approved',
  Completed = 'completed',
  Cancelled = 'cancelled',
  Closed = 'closed',
  PendingMatch = 'pending_match',
  DevRequested = 'dev_requested',
  RequirementsReview = 'requirements_review',
  NeedMoreInfo = 'need_more_info',
  ReadyForClientQA = 'ready_for_client_qa',
  QAFail = 'qa_fail',
  QAPass = 'qa_pass',
  ReadyForFinalAction = 'ready_for_final_action',
  Resolved = 'resolved'
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
