
import { createContext } from 'react';
import { AuthContextType } from './types';

// Create the auth context
export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  userType: null,
  userId: null,
  login: async () => false,
  register: async () => false,
  logout: async () => {},
  logoutUser: async () => {},
  isLoading: true,
});
