
import React, { useEffect } from 'react';
import { Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/auth';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import DashboardBanner from '../components/dashboard/DashboardBanner';
import ClientTicketDashboard from '../components/dashboard/ClientTicketDashboard';
import ClientTicketDetail from '../components/dashboard/ClientTicketDetail';
import LoginPrompt from '../components/dashboard/LoginPrompt';

const ClientDashboard = () => {
  const { isAuthenticated, userType } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // If user is authenticated but not as a client, redirect to developer dashboard
    if (isAuthenticated && userType !== 'client') {
      navigate('/developer-dashboard');
    }
  }, [isAuthenticated, userType, navigate]);

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return <LoginPrompt userType="client" />;
  }
  
  // If we're on a subpath, don't show the banner
  const showBanner = location.pathname === '/client';
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-4 px-4">
        {showBanner && (
          <>
            <DashboardHeader
              title="Client Dashboard"
              subtitle="Manage your help requests and work with developers"
            />
            <DashboardBanner 
              userType="client"
            />
          </>
        )}
        
        <div className={showBanner ? "mt-6" : ""}>
          <Routes>
            <Route index element={<ClientTicketDashboard />} />
            <Route path="tickets/:ticketId" element={<ClientTicketDetail />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
