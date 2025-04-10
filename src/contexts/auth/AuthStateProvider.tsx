
import React, { ReactNode } from 'react';
import { AuthContext } from './AuthContext';
import { useAuthState } from './hooks/useAuthState';

// Provider component to wrap the app
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
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
