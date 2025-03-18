
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
  { value: 'immediate', label: 'Immediate' },
  { value: '24hours', label: '24 hours' },
  { value: 'flexible', label: 'Flexible' }
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
  { value: 'open', label: 'Open' },
  { value: 'claimed', label: 'Claimed' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'pending', label: 'Pending' },
  { value: 'matching', label: 'Matching' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' }
];

export const matchStatusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' }
];

// Create a new type definition for the valid application statuses
// IMPORTANT: The order here should match the order in the database constraint
export type ApplicationStatus = 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
