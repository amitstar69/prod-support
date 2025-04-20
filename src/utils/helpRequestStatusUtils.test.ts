
import {
  isValidStatusTransition,
  getNextStatus,
  getAllowedActions,
  STATUSES
} from './helpRequestStatusUtils';

describe('Help Request Status Utilities', () => {
  describe('isValidStatusTransition', () => {
    it('allows valid developer transitions', () => {
      expect(isValidStatusTransition('in-progress', 'developer-qa', 'developer')).toBe(true);
      expect(isValidStatusTransition('developer-qa', 'client-review', 'developer')).toBe(true);
      expect(isValidStatusTransition('client-approved', 'completed', 'developer')).toBe(true);
    });

    it('allows valid client transitions', () => {
      expect(isValidStatusTransition('client-review', 'client-approved', 'client')).toBe(true);
      expect(isValidStatusTransition('client-review', 'in-progress', 'client')).toBe(true);
      expect(isValidStatusTransition('completed', 'in-progress', 'client')).toBe(true);
    });

    it('prevents invalid transitions', () => {
      expect(isValidStatusTransition('in-progress', 'completed', 'developer')).toBe(false);
      expect(isValidStatusTransition('client-review', 'developer-qa', 'client')).toBe(false);
    });
  });

  describe('getNextStatus', () => {
    it('returns correct next status for developers', () => {
      expect(getNextStatus('in-progress', 'developer')).toBe('developer-qa');
      expect(getNextStatus('developer-qa', 'developer')).toBe('client-review');
      expect(getNextStatus('client-approved', 'developer')).toBe('completed');
    });

    it('returns correct next status for clients', () => {
      expect(getNextStatus('client-review', 'client')).toBe('client-approved');
      expect(getNextStatus('completed', 'client')).toBe('in-progress');
    });
  });

  describe('getAllowedActions', () => {
    it('returns correct actions for developers', () => {
      const devInProgressActions = getAllowedActions('in-progress', 'developer');
      expect(devInProgressActions).toContain('developer-qa');
      
      const devQAActions = getAllowedActions('developer-qa', 'developer');
      expect(devQAActions).toContain('client-review');
    });

    it('returns correct actions for clients', () => {
      const clientReviewActions = getAllowedActions('client-review', 'client');
      expect(clientReviewActions).toContain('client-approved');
      expect(clientReviewActions).toContain('in-progress');
    });
  });
});
