
export interface HelpRequest {
  id?: string;
  client_id?: string;
  title?: string;
  description?: string;
  status?: string;
  technical_area?: string[];
  complexity_level?: string;
  urgency?: string;
  estimated_duration?: number;
  code_snippet?: string;
  communication_preference?: string[];
  budget_range?: string;
  created_at?: string;
  updated_at?: string;
  ticket_number?: number;
  attachments?: any[];
}

export interface DeveloperProfile {
  id: string;
  skills: string[];
  experience: string;
  hourly_rate: number;
}

export interface Profile {
  id?: string; 
  name?: string;
  image?: string;
  description?: string;
  location?: string;
}

export interface HelpRequestMatch {
  id?: string;
  request_id?: string;
  developer_id?: string;
  status?: string;
  match_score?: number;
  proposed_rate?: number;
  proposed_duration?: number;
  proposed_message?: string;
  created_at?: string;
  updated_at?: string;
  profiles?: Profile;
  developer_profiles?: DeveloperProfile;
}
