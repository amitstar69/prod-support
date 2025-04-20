
import {
  isValidStatusTransition,
  getNextStatus,
  getStatusLabel,
  getStatusDescription,
  canUpdateToStatus,
  getAllowedStatusTransitions,
  STATUSES
} from '../helpRequestStatusUtils';

describe('Help Request Status Utils', () => {
  // Test isValidStatusTransition function
  describe('isValidStatusTransition', () => {
    it('allows valid transitions for developers', () => {
      expect(isValidStatusTransition('pending_match', 'dev_requested', 'developer')).toBe(true);
      expect(isValidStatusTransition('approved', 'in_progress', 'developer')).toBe(true);
      expect(isValidStatusTransition('in_progress', 'ready_for_qa', 'developer')).toBe(true);
      expect(isValidStatusTransition('in_progress', 'abandoned_by_dev', 'developer')).toBe(true);
    });

    it('prevents invalid transitions for developers', () => {
      expect(isValidStatusTransition('pending_match', 'approved', 'developer')).toBe(false);
      expect(isValidStatusTransition('awaiting_client_approval', 'in_progress', 'developer')).toBe(false);
      expect(isValidStatusTransition('ready_for_qa', 'complete', 'developer')).toBe(false);
    });

    it('allows valid transitions for clients', () => {
      expect(isValidStatusTransition('awaiting_client_approval', 'approved', 'client')).toBe(true);
      expect(isValidStatusTransition('ready_for_qa', 'qa_feedback', 'client')).toBe(true);
      expect(isValidStatusTransition('ready_for_qa', 'complete', 'client')).toBe(true);
      expect(isValidStatusTransition('in_progress', 'cancelled_by_client', 'client')).toBe(true);
    });

    it('prevents invalid transitions for clients', () => {
      expect(isValidStatusTransition('pending_match', 'dev_requested', 'client')).toBe(false);
      expect(isValidStatusTransition('in_progress', 'ready_for_qa', 'client')).toBe(false);
    });
  });

  // Test getNextStatus function
  describe('getNextStatus', () => {
    it('returns the correct next status for developers', () => {
      expect(getNextStatus('pending_match', 'developer')).toBe('dev_requested');
      expect(getNextStatus('approved', 'developer')).toBe('in_progress');
      expect(getNextStatus('in_progress', 'developer')).toBe('ready_for_qa');
    });

    it('returns the correct next status for clients', () => {
      expect(getNextStatus('awaiting_client_approval', 'client')).toBe('approved');
      expect(getNextStatus('ready_for_qa', 'client')).toBe('qa_feedback');
    });

    it('returns null when there is no next status', () => {
      expect(getNextStatus('complete', 'developer')).toBeNull();
    });
  });

  // Test getAllowedStatusTransitions
  describe('getAllowedStatusTransitions', () => {
    it('returns all allowed transitions for developers', () => {
      expect(getAllowedStatusTransitions('pending_match', 'developer')).toContain('dev_requested');
      expect(getAllowedStatusTransitions('in_progress', 'developer')).toContain('ready_for_qa');
      
      // Should include the special 'any' transitions
      const inProgressTransitions = getAllowedStatusTransitions('in_progress', 'developer');
      expect(inProgressTransitions).toContain('abandoned_by_dev');
    });

    it('returns all allowed transitions for clients', () => {
      expect(getAllowedStatusTransitions('awaiting_client_approval', 'client')).toContain('approved');
      expect(getAllowedStatusTransitions('ready_for_qa', 'client')).toContain('qa_feedback');
      expect(getAllowedStatusTransitions('ready_for_qa', 'client')).toContain('complete');
      
      // Should include the special 'any' transitions
      const readyForQATransitions = getAllowedStatusTransitions('ready_for_qa', 'client');
      expect(readyForQATransitions).toContain('cancelled_by_client');
    });
  });

  // Test status label and description functions
  describe('Status labels and descriptions', () => {
    it('provides human-readable labels for statuses', () => {
      expect(getStatusLabel(STATUSES.PENDING_MATCH)).toBe('Pending Match');
      expect(getStatusLabel(STATUSES.IN_PROGRESS)).toBe('In Progress');
      expect(getStatusLabel(STATUSES.READY_FOR_QA)).toBe('Ready for QA');
    });

    it('provides detailed descriptions for statuses', () => {
      expect(getStatusDescription(STATUSES.PENDING_MATCH)).toContain('awaiting');
      expect(getStatusDescription(STATUSES.READY_FOR_QA)).toContain('completed work');
      expect(getStatusDescription(STATUSES.CANCELLED_BY_CLIENT)).toContain('cancelled');
    });
  });
});
