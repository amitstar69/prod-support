
import { ApplicationStatus } from './helpRequestStatus';

export interface HelpRequest {
  id?: string;
  client_id: string;
  client_name?: string;
  title: string;
  description: string;
  technical_area: string[];
  urgency: string;
  communication_preference: string[];
  estimated_duration: number;
  budget_range: string;
  code_snippet?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  complexity_level?: string;
  preferred_developer_experience?: string;
  attachments?: any;
  ticket_number?: number;
  nda_required?: boolean;
  preferred_developer_location?: string;
  cancellation_reason?: string;
}

export interface HelpRequestMatch {
  id?: string;
  request_id: string;
  developer_id: string;
  match_score?: number;
  status: string;
  created_at?: string;
  updated_at?: string;
  proposed_message?: string;
  proposed_duration?: number;
  proposed_rate?: number;
  developers?: {
    id: string;
    profiles: {
      name: string;
      image: string;
      description: string;
    }
  };
}

export interface HelpSession {
  id?: string;
  request_id: string;
  developer_id: string;
  client_id: string;
  scheduled_start?: string;
  scheduled_end?: string;
  actual_start?: string;
  actual_end?: string;
  status: string;
  final_cost?: number;
  created_at?: string;
  updated_at?: string;
}

export interface HelpRequestHistoryItem {
  id: string;
  help_request_id: string;
  change_type: string;
  previous_status: string | null;
  new_status: string | null;
  change_details: any;
  changed_at: string;
}

export interface ProfileSettings {
  id?: string;
  user_id: string;
  completed_first_session?: boolean;
  has_zoom?: boolean;
  payment_method_added?: boolean;
  onboarding_completed?: boolean;
  created_at?: string;
  updated_at?: string;
}
