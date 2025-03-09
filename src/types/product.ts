export interface Developer {
  id: string;
  name: string;
  hourlyRate: number;
  image: string;
  category: string;
  skills: string[];
  experience: string;
  description: string;
  rating: number;
  availability: boolean;
  featured?: boolean;
  minuteRate?: number;  // Field for per-minute billing
  online?: boolean;     // Field to show current online status
  lastActive?: string;  // Field to show when the developer was last active
  // Auth-related properties
  email?: string;
  password?: string;    // Added password field
  phone?: string;
  location?: string;
  joinedDate?: string;
  languages?: string[];
  preferredWorkingHours?: string;
  communicationPreferences?: string[];  // ["chat", "voice", "video"]
  profileCompleted?: boolean;
  // New fields for enhanced profile
  skillLevels?: {[skill: string]: number}; // Skill to proficiency level (1-5)
  yearsOfExperience?: number;
  portfolioLinks?: string[];
  githubProfile?: string;
  linkedinProfile?: string;
  certifications?: string[];
  specializations?: string[];
  availability_schedule?: {
    days: string[];
    hours: string;
  };
}

export interface Client {
  id: string;
  name: string;
  username?: string;
  email: string;
  password?: string;    // Added password field
  image?: string;
  location?: string;
  joinedDate?: string;
  languages?: string[];
  preferredWorkingHours?: string;
  description?: string;
  lookingFor?: string[];  // Skills/categories the client is interested in
  completedProjects?: number;
  profileCompletionPercentage?: number;
  profileCompleted?: boolean;
  // New fields for on-demand help
  preferredHelpFormat?: string[];  // ["Chat", "Voice", "Video"]
  budget?: number;  // Budget per session or per minute
  paymentMethod?: string; // ["Stripe", "PayPal"]
  bio?: string;
  techStack?: string[];
  budgetPerHour?: number;
  // Additional fields
  company?: string;
  position?: string;
  projectTypes?: string[];
  industry?: string;
  socialLinks?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  timeZone?: string;
  availability?: {
    days?: string[];
    hours?: string;
  };
  communicationPreferences?: string[];
}

export interface Category {
  id: string;
  name: string;
  image?: string;
}

// We'll keep Product type as an alias to Developer for backward compatibility
// This will help us avoid breaking changes in components that use Product
export type Product = Developer;

// Auth-related interfaces
export type AuthState = {
  isAuthenticated: boolean;
  userType: 'developer' | 'client' | null;
  userId: string | null;
};

export type AuthContextType = AuthState & {
  login: (email: string, password: string, userType: 'developer' | 'client') => Promise<boolean>;
  register: (userData: any, userType: 'developer' | 'client') => Promise<boolean>;
  logout: () => Promise<void>; // Updated to return Promise<void>
};

// Session management interfaces
export interface SessionRequest {
  id?: string;
  helpRequestId: string;
  developerId: string;
  clientId: string;
  requestedAt: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  scheduledStartTime?: string;
  scheduledEndTime?: string;
  message?: string;
}

export interface ActiveSession {
  id: string;
  helpRequestId: string;
  developerId: string;
  clientId: string;
  startedAt: string;
  endedAt?: string;
  status: 'active' | 'paused' | 'completed' | 'terminated';
  duration?: number; // in minutes
  chatHistory?: ChatMessage[];
  sharedCode?: string;
  sessionNotes?: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  senderId: string;
  senderType: 'developer' | 'client' | 'system';
  content: string;
  timestamp: string;
  attachmentUrl?: string;
  isCode?: boolean;
}

export interface SessionSummary {
  id: string;
  helpRequestId: string;
  developerId: string;
  developerName: string;
  clientId: string;
  clientName: string;
  date: string;
  duration: number; // in minutes
  cost: number;
  status: string;
  rating?: number;
  feedback?: string;
  topics: string[];
  solution?: string;
}
