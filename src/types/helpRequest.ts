
export interface HelpRequest {
  id?: string;
  client_id: string;
  title: string;
  description: string;
  technical_area: string[];
  urgency: string; // Changed from 'low' | 'medium' | 'high' to string
  communication_preference: string[];
  estimated_duration: number;
  budget_range: string;
  code_snippet?: string;
  status?: string; // Changed from enum to string
  created_at?: string;
  updated_at?: string;
}

export interface HelpRequestMatch {
  id?: string;
  request_id: string;
  developer_id: string;
  match_score?: number;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  created_at?: string;
  updated_at?: string;
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
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
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
