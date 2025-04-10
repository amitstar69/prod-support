
import React, { ReactNode } from 'react';
import { AuthContext } from './AuthContext';
import { useAuthState } from './hooks/useAuthState';

interface AuthProviderProps {
  children: ReactNode;
}

// Provider component to wrap the app
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const authState = useAuthState();
  
  return (
    <AuthContext.Provider
      value={authState}
    >
      {children}
    </AuthContext.Provider>
  );
};

// This is a duplicate export name for backward compatibility
export const AuthStateProvider = AuthProvider;
