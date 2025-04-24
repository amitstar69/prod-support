
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/auth';
import { toast } from 'sonner';

const LogoutPage = () => {
  const { logout } = useAuth();
  
  useEffect(() => {
    const performLogout = async () => {
      await logout();
      toast.success('You have been logged out successfully');
    };
    
    performLogout();
  }, [logout]);
  
  return <Navigate to="/login" replace />;
};

export default LogoutPage;
