
import { Notification } from '../types';

export const mockNotifications: Notification[] = [
  {
    id: 'notification-1',
    user_id: 'test-user',
    related_entity_id: 'request-1',
    entity_type: 'application',
    notification_type: 'new_application',
    title: 'New Developer Application',
    message: 'A developer has applied to your help request',
    is_read: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  // Add more mock notifications
];
