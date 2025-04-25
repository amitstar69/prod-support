
import React from 'react';
import { useTicketRecommendations } from '../../hooks/developerSearch/useTicketRecommendations';
import { useTicketFetching } from '../../hooks/dashboard/useTicketFetching';
import { useDeveloperProfile } from '../../hooks/useDeveloperProfile';
import { useAuth } from '../../contexts/auth';
import TicketSection from '../../components/dashboard/TicketSection';
import { useTicketApplicationActions } from '../../hooks/dashboard/useTicketApplicationActions';
import { Button } from '../../components/ui/button';
import { RefreshCw } from 'lucide-react';

const DeveloperTicketsPage: React.FC = () => {
  const { isAuthenticated, userId, userType } = useAuth();
  const { developer } = useDeveloperProfile();
  const { 
    tickets, 
    isLoading, 
    hasError, 
    handleForceRefresh 
  } = useTicketFetching(isAuthenticated, userType);
  
  const { recommendedTickets, availableTickets } = useTicketRecommendations(
    tickets,
    developer
  );

  // Create a dummy function to satisfy the type
  const dummyFetchMyApplications = async (_isAuthenticated: boolean, _userId: string | null): Promise<void> => {
    // This empty implementation satisfies the Promise<void> return type
    return Promise.resolve();
  };

  const { handleClaimTicket } = useTicketApplicationActions(
    isAuthenticated,
    userId,
    userType,
    handleForceRefresh,
    dummyFetchMyApplications // Use the async function that returns Promise<void>
  );

  if (hasError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
          Failed to load tickets. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Available Tickets</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={handleForceRefresh}
          disabled={isLoading}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {recommendedTickets.length > 0 && (
        <TicketSection
          title="Recommended for You"
          tickets={recommendedTickets}
          emptyMessage="No recommended tickets found at the moment."
          onClaimTicket={handleClaimTicket}
          userId={userId}
          isAuthenticated={isAuthenticated}
          viewMode="grid"
          onRefresh={handleForceRefresh}
          isRecommended={true}
        />
      )}

      <TicketSection
        title="All Available Gigs"
        tickets={availableTickets}
        emptyMessage="No available tickets found at the moment."
        onClaimTicket={handleClaimTicket}
        userId={userId}
        isAuthenticated={isAuthenticated}
        viewMode="grid"
        onRefresh={handleForceRefresh}
      />
    </div>
  );
};

export default DeveloperTicketsPage;
