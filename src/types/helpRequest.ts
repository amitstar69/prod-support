
export type HelpRequestStatus =
  | 'pending'
  | 'matching'
  | 'scheduled'
  | 'in-progress'
  | 'completed'
  | 'cancelled'
  | 'requirements'
  | 'todo'
  | 'in-progress-unpaid'
  | 'in-progress-paid'
  | 'client-review'
  | 'production';

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
  applications?: HelpRequestMatch[]; 
  application_status?: string;
}

export interface HelpRequestMatch {
  id: string;
  request_id: string;
  developer_id: string;
  proposed_message?: string;
  proposed_duration?: number;
  proposed_rate?: number;
  match_score?: number;
  status: string;
  created_at: string;
  updated_at: string;
  developer?: ProfileInfo;
}

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

export interface ChatMessage {
  id: string;
  sessionId: string;
  senderId: string;
  senderType: 'developer' | 'client' | 'system';
  content: string;
  timestamp: string;
  isCode?: boolean;
  attachmentUrl?: string;
}

// Export the constant options
export const technicalAreaOptions = [
  'Frontend',
  'Backend',
  'Database',
  'DevOps',
  'Mobile Development',
  'API Integration',
  'Performance Optimization',
  'UI/UX',
  'Bug Fixing',
  'Testing',
  'Security',
  'Architecture',
  'Cloud Services',
  'Data Analysis',
  'Machine Learning'
];

export const communicationOptions = [
  'Chat',
  'Voice Call',
  'Video Call',
  'Screen Sharing',
  'Code Review',
  'Pair Programming'
];

export const budgetRangeOptions = [
  'Under $50',
  '$50 - $100',
  '$100 - $200',
  '$200 - $500',
  'Over $500',
  'To be discussed'
];
