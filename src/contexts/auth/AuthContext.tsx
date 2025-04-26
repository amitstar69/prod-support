
import React, { createContext } from 'react';
import { AuthContextType } from './types';

// Create a context with proper default values
export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  userType: null,
  userId: null,
  login: async () => ({ success: false, error: 'Not implemented' }),
  loginWithOAuth: async () => ({ success: false, error: 'Not implemented' }),
  register: async () => false,
  logout: async () => false,
  logoutUser: async () => false,
  isLoading: true,
  initializationFailed: false,
});
