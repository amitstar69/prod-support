
import React from 'react';
import Layout from '../components/Layout';
import DashboardBanner from '../components/dashboard/DashboardBanner';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import LoginPrompt from '../components/dashboard/LoginPrompt';
import TicketFiltersContainer from '../components/dashboard/TicketFiltersContainer';
import TicketList from '../components/tickets/TicketList';
import LoadingState from '../components/dashboard/LoadingState';
import EmptyTicketState from '../components/dashboard/EmptyTicketState';
import TicketControls from '../components/dashboard/TicketControls';
import TicketSummary from '../components/dashboard/TicketSummary';
import { useDeveloperDashboard } from '../hooks/useDeveloperDashboard';

const DeveloperDashboard = () => {
  const {
    tickets,
    filteredTickets,
    isLoading,
    filters,
    showFilters,
    setShowFilters,
    isAuthenticated,
    userId,
    dataSource,
    handleFilterChange,
    handleClaimTicket,
    handleForceRefresh,
    fetchTickets
  } = useDeveloperDashboard();

  return (
    <Layout>
      <DashboardBanner />
      
      <div className="container mx-auto py-8 px-4">
        <DashboardHeader 
          showFilters={showFilters} 
          setShowFilters={setShowFilters} 
          onRefresh={fetchTickets} 
        />
        
        {!isAuthenticated && (
          <div className="mb-8">
            <LoginPrompt />
          </div>
        )}
        
        <TicketControls 
          onForceRefresh={handleForceRefresh}
          showLoadMore={filteredTickets.length >= 5}
        />
        
        {showFilters && (
          <div className="mb-6">
            <TicketFiltersContainer 
              filters={filters} 
              onFilterChange={handleFilterChange} 
            />
          </div>
        )}

        {isLoading ? (
          <LoadingState />
        ) : filteredTickets.length > 0 ? (
          <>
            <TicketSummary 
              filteredCount={filteredTickets.length} 
              totalCount={tickets.length} 
              dataSource={dataSource}
            />
            
            <TicketList 
              tickets={filteredTickets} 
              onClaimTicket={handleClaimTicket}
              currentUserId={userId}
              isAuthenticated={isAuthenticated}
            />
          </>
        ) : (
          <EmptyTicketState 
            tickets={tickets}
            isAuthenticated={isAuthenticated}
            onRefresh={fetchTickets}
            dataSource={dataSource}
          />
        )}
      </div>
    </Layout>
  );
};

export default DeveloperDashboard;
