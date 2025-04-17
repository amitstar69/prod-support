
import { User } from '@/contexts/auth/types';

export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TicketStatus = 
  | 'draft'
  | 'open'
  | 'assigned'
  | 'in_progress'
  | 'completed'
  | 'closed'
  | 'cancelled';

export type TicketCategory =
  | 'bug_fix'
  | 'feature_development'
  | 'code_review'
  | 'architecture'
  | 'optimization'
  | 'debugging'
  | 'consultation'
  | 'other';

export interface Ticket {
  id: string;
  title: string;
  description: string;
  clientId: string;
  developerId?: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  estimatedHours?: number;
  budget?: number;
  createdAt: Date;
  updatedAt: Date;
  deadline?: Date;
  tags: string[];
}

export interface TicketApplication {
  id: string;
  ticketId: string;
  developerId: string;
  developer?: User;
  coverLetter: string;
  estimatedHours: number;
  price?: number;
  createdAt: Date;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface TicketComment {
  id: string;
  ticketId: string;
  userId: string;
  user?: User;
  content: string;
  createdAt: Date;
  attachments?: string[];
  isPrivate?: boolean;
}

export interface TicketAttachment {
  id: string;
  ticketId: string;
  userId: string;
  filename: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  createdAt: Date;
}

export interface TicketFilter {
  status?: TicketStatus[];
  priority?: TicketPriority[];
  category?: TicketCategory[];
  search?: string;
  tags?: string[];
  startDate?: Date;
  endDate?: Date;
  minBudget?: number;
  maxBudget?: number;
}

export interface TicketSortOptions {
  field: 'createdAt' | 'updatedAt' | 'priority' | 'budget' | 'deadline';
  direction: 'asc' | 'desc';
}
