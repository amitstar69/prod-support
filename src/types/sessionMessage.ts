
export interface SessionMessage {
  id: string;
  session_id: string;
  sender_id: string;
  sender_type: string;
  content: string;
  is_code?: boolean;
  attachment_url?: string | null;
  created_at: string;
  updated_at: string;
}
