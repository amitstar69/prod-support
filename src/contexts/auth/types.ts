
// Import the Developer and Client types from the product types file
import { Developer, Client } from '../../types/product';

export interface AuthState {
  isAuthenticated: boolean;
  userType: 'developer' | 'client' | null;
  userId: string | null;
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string, userType: 'developer' | 'client') => Promise<boolean>;
  register: (userData: any, userType: 'developer' | 'client') => Promise<boolean>;
  logout: () => Promise<void>;
  logoutUser: () => Promise<void>;
  isLoading: boolean; // Loading state in the context
}

// Additional types for userData context operations
export interface UserDataContextType {
  getCurrentUserData: () => Promise<Developer | Client | null>;
  updateUserData: (userData: Partial<Developer | Client>) => Promise<boolean>;
  invalidateUserDataCache: (userId: string) => void;
  isLoadingUserData: boolean;
  userData: Developer | Client | null;
  userDataError: string | null;
}

// Type for authentication responses
export interface AuthResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
    userType: 'developer' | 'client';
  } | null;
  error?: string;
  session?: any;
}
