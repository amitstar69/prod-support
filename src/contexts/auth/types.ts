
import { Developer, Client } from '../../types/product';

export type UserType = 'developer' | 'client';

export interface AuthState {
  isAuthenticated: boolean;
  userType: UserType | null;
  userId: string | null;
}

export interface AuthContextType {
  authState: AuthState;
  setAuthState: (state: AuthState) => void;
  logout: () => Promise<void>;
  login: (email: string, password: string, userType: UserType) => Promise<boolean>;
  register: (
    userData: Partial<Developer | Client>,
    userType: UserType,
    skills?: string[],
    categories?: string[],
    onSuccess?: () => void,
    onError?: (error: string) => void,
    setAuthState?: (state: AuthState) => void
  ) => Promise<boolean>;
  isLoading: boolean;
}
