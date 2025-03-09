
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
import { useDeveloperDashboard } from '../hooks/dashboard/useDeveloperDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

const DeveloperDashboard = () => {
  const {
    tickets,
    filteredTickets,
    recommendedTickets,
    myApplications,
    isLoading,
    filters,
    showFilters,
    setShowFilters,
    isAuthenticated,
    userId,
    activeTab,
    setActiveTab,
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
        ) : (
          <Tabs 
            defaultValue={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="mb-6">
              {isAuthenticated && (
                <TabsTrigger value="recommended" className="flex-1">
                  Recommended for You
                </TabsTrigger>
              )}
              <TabsTrigger value="all" className="flex-1">
                All Tickets
              </TabsTrigger>
              {isAuthenticated && (
                <TabsTrigger value="myApplications" className="flex-1">
                  My Applications
                </TabsTrigger>
              )}
            </TabsList>
            
            {isAuthenticated && (
              <TabsContent value="recommended" className="mt-0">
                <TicketSummary 
                  filteredCount={recommendedTickets.length} 
                  totalCount={tickets.length} 
                  dataSource={dataSource}
                  categoryTitle="Recommended Tickets"
                />
                
                {recommendedTickets.length > 0 ? (
                  <TicketList 
                    tickets={recommendedTickets} 
                    onClaimTicket={handleClaimTicket}
                    currentUserId={userId}
                    isAuthenticated={isAuthenticated}
                    isRecommended={true}
                  />
                ) : (
                  <EmptyTicketState 
                    tickets={tickets}
                    isAuthenticated={isAuthenticated}
                    onRefresh={fetchTickets}
                    dataSource={dataSource}
                    customMessage="No recommended tickets found. We'll suggest tickets that match your skills as they become available."
                  />
                )}
              </TabsContent>
            )}
            
            <TabsContent value="all" className="mt-0">
              <TicketSummary 
                filteredCount={filteredTickets.length} 
                totalCount={tickets.length} 
                dataSource={dataSource}
                categoryTitle="All Available Help Requests"
              />
              
              {filteredTickets.length > 0 ? (
                <TicketList 
                  tickets={filteredTickets} 
                  onClaimTicket={handleClaimTicket}
                  currentUserId={userId}
                  isAuthenticated={isAuthenticated}
                />
              ) : (
                <EmptyTicketState 
                  tickets={tickets}
                  isAuthenticated={isAuthenticated}
                  onRefresh={fetchTickets}
                  dataSource={dataSource}
                />
              )}
            </TabsContent>
            
            {isAuthenticated && (
              <TabsContent value="myApplications" className="mt-0">
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
              </TabsContent>
            )}
          </Tabs>
        )}
      </div>
    </Layout>
  );
};

export default DeveloperDashboard;
