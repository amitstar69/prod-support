import React from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/auth';
import { HelpRequest, HelpRequestMatch } from '../types/helpRequest';
import HelpRequestsTracking from '../components/help/HelpRequestsTracking';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';
import TicketListContainer from '../components/dashboard/TicketListContainer';

const ClientDashboard: React.FC = () => {
  const { userId } = useAuth();
  const navigate = useNavigate();

  const handleCreateRequest = () => {
    navigate('/create-help-request');
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="heading-2 mb-4">Client Dashboard</h1>
        <Button onClick={handleCreateRequest} className="mb-4">
          Create New Help Request
        </Button>
        <HelpRequestsTracking />
        <TicketListContainer />
      </div>
    </Layout>
  );
};

export default ClientDashboard;
