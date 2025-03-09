export type HelpRequestStatus =
  | 'pending'
  | 'matching'
  | 'scheduled'
  | 'in-progress'
  | 'completed'
  | 'cancelled';

export interface ProfileInfo {
  id: string;
  name: string;
  image?: string;
}

export interface HelpRequest {
  id: string;
  title: string;
  description: string;
  technical_area: string[];
  urgency: string;
  budget_range: string;
  communication_preference: string[];
  client_id: string;
  estimated_duration: number;
  code_snippet?: string | null;
  status: HelpRequestStatus;
  created_at: string;
  updated_at: string;
  client?: ProfileInfo;
  applications?: Array<any>; // Adding applications property
  application_status?: string; // Adding application_status property
}
