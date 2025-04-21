
import React, { useEffect, useCallback, useState } from 'react';
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
import { toast } from 'sonner';

const MyApplicationsPage = () => {
  const navigate = useNavigate();
  const { userId, userType, isAuthenticated } = useAuth();
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  
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
      console.log('MyApplicationsPage: Fetching applications');
      fetchMyApplications(isAuthenticated, userId)
        .catch(error => {
          console.error('Error fetching applications:', error);
          toast.error('Failed to load your applications');
        })
        .finally(() => {
          // Set loading to false only after the fetch completes
          setIsLoadingPage(false);
        });
    } else {
      setIsLoadingPage(false);
    }
  }, [userId, isAuthenticated, fetchMyApplications]);

  useEffect(() => {
    // Check that this page is only accessed by developers
    if (isAuthenticated && userType !== 'developer') {
      navigate('/client-dashboard');
    }
  }, [isAuthenticated, userType, navigate]);
  
  useEffect(() => {
    // Fetch applications when component mounts
    fetchApplications();
    
    // Set a timeout to ensure we don't get stuck in loading state
    const timeoutId = setTimeout(() => {
      if (isLoadingPage) {
        setIsLoadingPage(false);
        console.log('MyApplicationsPage: Forced loading state to finish after timeout');
      }
    }, 5000);
    
    return () => clearTimeout(timeoutId);
  }, [fetchApplications]);
  
  // Update loading page state when child components report loading finished
  useEffect(() => {
    if (!isLoading && !isLoadingApplications && isLoadingPage) {
      setIsLoadingPage(false);
    }
  }, [isLoading, isLoadingApplications, isLoadingPage]);
  
  // Debug loading state
  useEffect(() => {
    console.log('MyApplicationsPage loading state:', { 
      isLoadingPage, 
      isLoading, 
      isLoadingApplications,
      applicationsCount: myApplications?.length || 0
    });
  }, [isLoadingPage, isLoading, isLoadingApplications, myApplications]);

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
        
        {isLoadingPage || isLoading || isLoadingApplications ? (
          <LoadingState 
            message="Loading your applications..." 
            description="We're retrieving all your approved applications from the database."
          />
        ) : (
          <div>
            <TicketSummary 
              filteredCount={myApplications?.length || 0} 
              totalCount={myApplications?.length || 0} 
              dataSource={dataSource}
              categoryTitle="My Approved Tickets"
            />
            
            {myApplications && myApplications.length > 0 ? (
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
