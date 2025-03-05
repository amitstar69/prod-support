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
  phone?: string;
  location?: string;
  joinedDate?: string;
  languages?: string[];
  preferredWorkingHours?: string;
  communicationPreferences?: string[];  // ["chat", "voice", "video"]
  profileCompleted?: boolean;
}

export interface Client {
  id: string;
  fullName: string;
  username: string;
  email: string;
  image?: string;
  location: string;
  bio?: string;
  techStack: string[];
  preferredHelpFormat: 'Chat' | 'Voice' | 'Video';
  budgetPerHour: number;
  paymentMethod: 'Stripe' | 'PayPal';
  joinedDate?: string;
  profileCompleted?: boolean;
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
export interface AuthState {
  isAuthenticated: boolean;
  userType: 'developer' | 'client' | null;
  userId: string | null;
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string, userType: 'developer' | 'client') => Promise<boolean>;
  register: (userData: Partial<Developer | Client>, userType: 'developer' | 'client') => Promise<boolean>;
  logout: () => void;
}
