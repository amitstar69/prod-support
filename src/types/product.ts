
export interface Developer {
  id: string;
  firstName?: string;
  lastName?: string;
  name: string;
  email: string;
  password?: string;
  location?: string;
  image?: string;
  skills?: string[];
  category?: string;
  experience?: string;
  hourlyRate?: number;
  minuteRate?: number;
  availability?: boolean | { days?: string[]; hours?: string; };
  rating?: number;
  communicationPreferences?: string[];
  description?: string;
  username?: string;
  profileCompleted?: boolean;
  bio?: string;
  education?: any[];
  certifications?: any[];
  portfolioItems?: any[];
  languagesSpoken?: any[];
  premiumVerified?: boolean;
  
  // Additional properties
  featured?: boolean;
  online?: boolean;
  lastActive?: string;
  phone?: string;
  profileCompletionPercentage?: number;
  languages?: string[];
  preferredWorkingHours?: string;
}

export interface Client {
  id: string;
  name: string;
  username?: string;
  email: string;
  password?: string;
  image?: string;
  location?: string;
  joinedDate?: string;
  languages?: string[];
  preferredWorkingHours?: string;
  description?: string;
  lookingFor?: string[];
  completedProjects?: number;
  profileCompletionPercentage?: number;
  profileCompleted?: boolean;
  completedFirstSession?: boolean;
  hasZoom?: boolean;
  paymentMethodAdded?: boolean;
  preferredHelpFormat?: string[];
  budget?: number;
  paymentMethod?: string;
  bio?: string;
  techStack?: string[];
  budgetPerHour?: number;
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
  } | boolean;
  communicationPreferences?: string[];
  onboardingCompletedAt?: string;
  skills?: string[];
  hourlyRate?: number;
  minuteRate?: number;
  experience?: string;
  category?: string;
}

export interface Category {
  id: string;
  name: string;
  image?: string;
}

export type Product = Developer;

export interface AuthState {
  isAuthenticated: boolean;
  userType: 'developer' | 'client' | null;
  userId: string | null;
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

export interface AuthContextType extends AuthState {
  login: (email: string, password: string, userType: 'developer' | 'client') => Promise<boolean>;
  register: (userData: any, userType: 'developer' | 'client') => Promise<boolean>;
  logout: () => Promise<void>; 
  logoutUser: () => Promise<void>;
}
