
import { LoginResult } from './authLogin';

export type UserType = 'developer' | 'client';

export interface AuthState {
  isAuthenticated: boolean;
  userType: UserType | null;
  userId: string | null;
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string, userType: UserType) => Promise<LoginResult>;
  register: (userData: any, userType: UserType) => Promise<boolean>;
  logout: () => Promise<boolean>;
  logoutUser: () => Promise<boolean>;
  isLoading: boolean;
}
