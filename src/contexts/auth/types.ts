
// Remove the import and re-export since we're declaring AuthState directly in this file
// This was causing the conflict
import { LoginResult } from './authLogin';

export interface AuthState {
  isAuthenticated: boolean;
  userType: 'developer' | 'client' | null;
  userId: string | null;
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string, userType: 'developer' | 'client') => Promise<LoginResult>;
  register: (userData: any, userType: 'developer' | 'client') => Promise<boolean>;
  logout: () => Promise<void>;
  logoutUser: () => Promise<void>;
  isLoading: boolean; // Loading state in the context
}
