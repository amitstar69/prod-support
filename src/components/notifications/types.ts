
export interface Notification {
  id: string;
  user_id: string;
  related_entity_id: string;
  entity_type: string;
  notification_type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
  action_data?: {
    application_id?: string;
    developer_id?: string;
    developer_name?: string;
    request_id?: string;
    request_title?: string;
    status?: string;
    client_name?: string;
  };
}
