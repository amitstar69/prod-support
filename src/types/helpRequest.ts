
export interface HelpRequest {
  id?: string;
  client_id: string;
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
}

export interface HelpRequestMatch {
  id?: string;
  request_id: string;
  developer_id: string;
  match_score?: number;
  status: string; // Changed from specific literals to allow any string from database
  created_at?: string;
  updated_at?: string;
  proposed_message?: string;
  proposed_duration?: number;
  proposed_rate?: number;
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
  status: string; // Changed from specific literals to allow any string from database
  final_cost?: number;
  created_at?: string;
  updated_at?: string;
}

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

// Updated to match the database constraint for help_requests_status_check
export const requestStatusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'matching', label: 'Matching' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' }
];
