
export interface ExtendedNotification {
  id: string;
  user_id: string;
  related_entity_id: string;
  entity_type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
  notification_type: string;
  action_data?: {
    application_id?: string;
    developer_name?: string;
    request_title?: string;
    request_id?: string;
    status?: string;
  };
}
