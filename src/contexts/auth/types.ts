
import { LoginResult } from './authLogin';

export type UserType = 'developer' | 'client' | null;

export interface AuthState {
  isAuthenticated: boolean;
  userId: string | null;
  userType: UserType;
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string, userType: 'developer' | 'client', rememberMe?: boolean) => Promise<LoginResult>;
  register: (userData: any, userType: 'developer' | 'client') => Promise<boolean>;
  logout: () => Promise<boolean>;
  logoutUser: () => Promise<boolean>;
  isLoading: boolean;
}
