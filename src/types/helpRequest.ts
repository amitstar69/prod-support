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
  qa_start_time?: string;
  qa_complete_time?: string;
  client_review_start_time?: string;
  client_review_complete_time?: string;
  developer_qa_notes?: string;
  client_feedback?: string;
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

export type ApplicationStatus = 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';

export const technicalAreaOptions = [
  'Frontend',
  'Backend',
  'Full Stack',
  'Mobile Development',
  'DevOps',
  'Database',
  'API Integration',
  'Security',
  'Performance Optimization',
  'Debugging',
  'Testing',
  'UI/UX',
  'AI/ML Integration',
  'Cloud Services',
  'Code Review'
];

export const communicationOptions = [
  'Chat',
  'Voice Call',
  'Video Call',
  'Screen Sharing'
];

export const budgetRangeOptions = [
  'Under $50',
  '$50 - $100',
  '$100 - $200',
  '$200 - $500',
  '$500+'
];

export const urgencyOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' }
];

export const locationOptions = [
  { value: 'Global', label: 'Global' },
  { value: 'North America', label: 'North America' },
  { value: 'Europe', label: 'Europe' },
  { value: 'Asia', label: 'Asia' },
  { value: 'Australia', label: 'Australia' },
  { value: 'South America', label: 'South America' },
  { value: 'Africa', label: 'Africa' }
];

export const requestStatusOptions = [
  { value: 'submitted', label: 'Submitted' },
  { value: 'pending_match', label: 'Pending Match' },
  { value: 'dev_requested', label: 'Developer Requested' },
  { value: 'awaiting_client_approval', label: 'Awaiting Approval' },
  { value: 'approved', label: 'Approved' },
  { value: 'requirements_review', label: 'Requirements Review' },
  { value: 'need_more_info', label: 'Need More Info' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'ready_for_client_qa', label: 'Ready for Client QA' },
  { value: 'qa_fail', label: 'QA Failed' },
  { value: 'qa_pass', label: 'QA Passed' },
  { value: 'ready_for_final_action', label: 'Ready for Final Action' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'cancelled_by_client', label: 'Cancelled' }
];

export const matchStatusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' }
];

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

export interface ClientProfile {
  id?: string;
  name?: string;
  email?: string;
  image?: string;
  user_type?: string;
  company?: string;
  position?: string;
  location?: string;
  description?: string;
  technical_interests?: string[];
  created_at?: string;
  updated_at?: string;
  has_zoom?: boolean;
  completed_first_session?: boolean;
  payment_method_added?: boolean;
}

export interface DeveloperProfile {
  id?: string;
  name?: string;
  email?: string;
  image?: string;
  user_type?: string;
  title?: string;
  skills?: string[];
  hourly_rate?: number;
  experience_years?: number;
  created_at?: string;
  updated_at?: string;
  rating?: number;
  availability?: boolean;
  bio?: string;
}
