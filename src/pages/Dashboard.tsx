
import React from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/auth';
import { Navigate } from 'react-router-dom';

const Dashboard = () => {
  const { userType } = useAuth();
  
  // Redirect to the appropriate dashboard based on user type
  if (userType === 'client') {
    return <Navigate to="/client/dashboard" replace />;
  } else if (userType === 'developer') {
    return <Navigate to="/developer/dashboard" replace />;
  } else if (userType === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  
  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <p>Welcome to the dashboard. Please select your role to continue.</p>
      </div>
    </Layout>
  );
};

export default Dashboard;
