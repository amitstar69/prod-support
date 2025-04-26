
import { LoginResult } from './authLogin';

export type UserType = 'client' | 'developer';
export type OAuthProvider = 'google' | 'github';

export interface AuthState {
  isAuthenticated: boolean;
  userType: UserType | null;
  userId: string | null;
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string, userType: UserType, rememberMe?: boolean) => Promise<LoginResult>;
  loginWithOAuth: (provider: OAuthProvider, userType: UserType) => Promise<LoginResult>;
  register: (userData: any, userType: UserType) => Promise<boolean>;
  logout: () => Promise<boolean>;
  logoutUser: () => Promise<boolean>;
  isLoading: boolean;
  initializationFailed: boolean;
  initializeAuth?: () => Promise<void>;
}
