
import { HelpRequest, ProfileInfo } from './helpRequest';

export interface HelpSession {
  id: string;
  request_id: string;
  client_id: string;
  developer_id: string;
  scheduled_start?: string | null;
  scheduled_end?: string | null;
  actual_start?: string | null;
  actual_end?: string | null;
  final_cost?: number | null;
  status: string;
  shared_code?: string | null;
  created_at: string;
  updated_at: string;
  client?: ProfileInfo;
  developer?: ProfileInfo;
  request?: HelpRequest;
}
