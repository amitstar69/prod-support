
import React from 'react';
import Layout from '../components/Layout';
import DashboardBanner from '../components/dashboard/DashboardBanner';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import TicketList from '../components/tickets/TicketList';
import LoadingState from '../components/dashboard/LoadingState';
import EmptyTicketState from '../components/dashboard/EmptyTicketState';
import TicketSummary from '../components/dashboard/TicketSummary';
import { useDeveloperDashboard } from '../hooks/dashboard/useDeveloperDashboard';

const MyApplicationsPage = () => {
  const {
    tickets,
    myApplications,
    isLoading,
    isAuthenticated,
    userId,
    dataSource,
    handleClaimTicket,
    fetchTickets
  } = useDeveloperDashboard();

  return (
    <Layout>
      <DashboardBanner />
      
      <div className="container mx-auto py-8 px-4">
        <DashboardHeader 
          showFilters={false}
          setShowFilters={() => {}} 
          onRefresh={fetchTickets}
          title="My Applications"
          description="Manage and track your active gig applications"
          hideFilterButton={true}
        />
        
        {isLoading ? (
          <LoadingState />
        ) : (
          <div>
            <TicketSummary 
              filteredCount={myApplications.length} 
              totalCount={myApplications.length} 
              dataSource={dataSource}
              categoryTitle="My Applications"
            />
            
            {myApplications.length > 0 ? (
              <TicketList 
                tickets={myApplications} 
                onClaimTicket={handleClaimTicket}
                currentUserId={userId}
                isAuthenticated={isAuthenticated}
                isApplication={true}
              />
            ) : (
              <EmptyTicketState 
                tickets={tickets}
                isAuthenticated={isAuthenticated}
                onRefresh={fetchTickets}
                dataSource={dataSource}
                customMessage="You haven't applied to any tickets yet. Browse available tickets and start applying!"
              />
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyApplicationsPage;
