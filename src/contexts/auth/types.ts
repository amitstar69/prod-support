
import { AuthState } from '../../types/product';

// Re-export types from product.ts to centralize auth-related types
export type { AuthState };

export interface AuthContextType extends AuthState {
  login: (email: string, password: string, userType: 'developer' | 'client') => Promise<boolean>;
  register: (userData: any, userType: 'developer' | 'client') => Promise<boolean>;
  logout: () => Promise<void>;
}
