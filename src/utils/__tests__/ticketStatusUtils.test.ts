
import { 
  TicketStatus,
  isValidStatusTransition,
  getStatusLabel,
  getStatusDescription,
  getAllowedStatusTransitions
} from '../ticketStatusUtils';

describe('ticketStatusUtils', () => {
  describe('isValidStatusTransition', () => {
    it('should allow valid developer transitions', () => {
      expect(isValidStatusTransition(TicketStatus.OPEN, TicketStatus.ACCEPTED, 'developer')).toBe(true);
      expect(isValidStatusTransition(TicketStatus.ACCEPTED, TicketStatus.IN_PROGRESS, 'developer')).toBe(true);
    });

    it('should allow valid client transitions', () => {
      expect(isValidStatusTransition(TicketStatus.COMPLETED, TicketStatus.CLOSED, 'client')).toBe(true);
      expect(isValidStatusTransition(TicketStatus.COMPLETED, TicketStatus.NEEDS_INFO, 'client')).toBe(true);
    });

    it('should prevent invalid transitions', () => {
      expect(isValidStatusTransition(TicketStatus.CLOSED, TicketStatus.OPEN, 'developer')).toBe(false);
      expect(isValidStatusTransition(TicketStatus.IN_PROGRESS, TicketStatus.ACCEPTED, 'developer')).toBe(false);
    });
  });

  describe('getStatusLabel', () => {
    it('should return formatted status labels', () => {
      expect(getStatusLabel('needs_info')).toBe('Needs Info');
      expect(getStatusLabel('in_progress')).toBe('In Progress');
    });
  });

  describe('getAllowedStatusTransitions', () => {
    it('should return correct transitions for developers', () => {
      const transitions = getAllowedStatusTransitions('open', 'developer');
      expect(transitions).toContain(TicketStatus.ACCEPTED);
      expect(transitions).toContain(TicketStatus.CLOSED);
    });

    it('should return correct transitions for clients', () => {
      const transitions = getAllowedStatusTransitions('completed', 'client');
      expect(transitions).toContain(TicketStatus.CLOSED);
      expect(transitions).toContain(TicketStatus.NEEDS_INFO);
    });

    it('should return empty array for invalid status', () => {
      expect(getAllowedStatusTransitions('invalid_status', 'developer')).toEqual([]);
    });
  });
});
