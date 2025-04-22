
import { PermissionAction, checkTicketPermission } from '../permissions';
import { TicketStatus } from '../ticketStatusUtils';

describe('checkTicketPermission', () => {
  const mockTicket = {
    id: '123',
    status: TicketStatus.OPEN,
    client_id: 'client123'
  };

  describe('VIEW_TICKET permission', () => {
    it('should allow developers to view any ticket', () => {
      const result = checkTicketPermission(
        PermissionAction.VIEW_TICKET,
        'developer',
        'dev123',
        mockTicket
      );
      expect(result.can).toBe(true);
    });

    it('should allow clients to view their own tickets', () => {
      const result = checkTicketPermission(
        PermissionAction.VIEW_TICKET,
        'client',
        'client123',
        mockTicket
      );
      expect(result.can).toBe(true);
    });

    it('should not allow clients to view other clients tickets', () => {
      const result = checkTicketPermission(
        PermissionAction.VIEW_TICKET,
        'client',
        'other-client',
        mockTicket
      );
      expect(result.can).toBe(false);
    });
  });

  describe('EDIT_TICKET permission', () => {
    it('should allow clients to edit their own open tickets', () => {
      const result = checkTicketPermission(
        PermissionAction.EDIT_TICKET,
        'client',
        'client123',
        mockTicket
      );
      expect(result.can).toBe(true);
    });

    it('should not allow developers to edit tickets', () => {
      const result = checkTicketPermission(
        PermissionAction.EDIT_TICKET,
        'developer',
        'dev123',
        mockTicket
      );
      expect(result.can).toBe(false);
    });
  });

  describe('Authentication check', () => {
    it('should deny permissions when user is not authenticated', () => {
      const result = checkTicketPermission(
        PermissionAction.VIEW_TICKET,
        null,
        null,
        mockTicket
      );
      expect(result.can).toBe(false);
      expect(result.message).toBe('You must be logged in');
    });
  });

  describe('Invalid ticket check', () => {
    it('should deny permissions when ticket is not found', () => {
      const result = checkTicketPermission(
        PermissionAction.VIEW_TICKET,
        'developer',
        'dev123',
        null
      );
      expect(result.can).toBe(false);
      expect(result.message).toBe('Ticket not found');
    });
  });
});
