
import { createContext } from 'react';
import { AuthContextType } from './types';
import { LoginResult } from './authLogin';

// Create the auth context
export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  userType: null,
  userId: null,
  login: async () => ({ success: false, error: 'Not implemented' }), // Return LoginResult object
  register: async () => false,
  logout: async () => {},
  logoutUser: async () => {},
  isLoading: true,
});
