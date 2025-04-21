
import React, { useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import DashboardBanner from '../components/dashboard/DashboardBanner';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import LoadingState from '../components/dashboard/LoadingState';
import EmptyTicketState from '../components/dashboard/EmptyTicketState';
import TicketSummary from '../components/dashboard/TicketSummary';
import TicketListContainer from '../components/dashboard/TicketListContainer';
import { useDeveloperDashboard } from '../hooks/dashboard/useDeveloperDashboard';
import { useAuth } from '../contexts/auth';
import { useNavigate } from 'react-router-dom';

const MyApplicationsPage = () => {
  const navigate = useNavigate();
  const { userId, userType, isAuthenticated } = useAuth();
  
  const {
    myApplications,
    isLoading,
    isLoadingApplications,
    dataSource,
    handleClaimTicket,
    fetchMyApplications
  } = useDeveloperDashboard();
  
  // Memoize fetchApplications to prevent recreation on render
  const fetchApplications = useCallback(() => {
    if (userId && isAuthenticated) {
      fetchMyApplications(isAuthenticated, userId);
    }
  }, [userId, isAuthenticated, fetchMyApplications]);

  useEffect(() => {
    // Check that this page is only accessed by developers
    if (isAuthenticated && userType !== 'developer') {
      navigate('/client-dashboard');
    }
  }, [isAuthenticated, userType, navigate]);
  
  useEffect(() => {
    // Fetch applications when component mounts or userId changes
    fetchApplications();
  }, [fetchApplications]);

  return (
    <Layout>
      <DashboardBanner />
      
      <div className="container mx-auto py-8 px-4">
        <DashboardHeader 
          showFilters={false}
          setShowFilters={() => {}} 
          onRefresh={fetchApplications}
          title="My Applications"
          description="Manage and track your approved tickets"
          hideFilterButton={true}
        />
        
        {isLoading || isLoadingApplications ? (
          <LoadingState />
        ) : (
          <div>
            <TicketSummary 
              filteredCount={myApplications.length} 
              totalCount={myApplications.length} 
              dataSource={dataSource}
              categoryTitle="My Approved Tickets"
            />
            
            {myApplications.length > 0 ? (
              <TicketListContainer
                filteredTickets={myApplications}
                totalTickets={myApplications.length}
                onClaimTicket={handleClaimTicket}
                userId={userId}
                isAuthenticated={isAuthenticated}
                onRefresh={fetchApplications}
              />
            ) : (
              <EmptyTicketState 
                tickets={[]}
                isAuthenticated={isAuthenticated}
                onRefresh={fetchApplications}
                dataSource={dataSource}
                customMessage="You don't have any approved tickets yet. Apply to available tickets and wait for client approval to see them here."
              />
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyApplicationsPage;
