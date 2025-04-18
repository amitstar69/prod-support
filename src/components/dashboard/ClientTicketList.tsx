
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/auth';
import { HelpRequest } from '../../types/helpRequest';
import TicketListContainer from './TicketListContainer';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const ClientTicketList: React.FC = () => {
  const { userId, isAuthenticated } = useAuth();
  const [tickets, setTickets] = useState<HelpRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchClientTickets = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, this would fetch from your API
      // For now, we'll simulate data
      const mockTickets: HelpRequest[] = [
        {
          id: '1',
          title: 'Help with React Component',
          description: 'I need help optimizing a slow-rendering React component',
          status: 'open',
          client_id: userId || undefined,
          created_at: new Date().toISOString(),
          technical_area: ['React', 'Performance'],
          urgency: 'medium',
          estimated_duration: 30,
          communication_preference: ['chat', 'video'],
          budget_range: '$$'
        },
        {
          id: '2',
          title: 'Database Query Issue',
          description: 'My PostgreSQL query is taking too long to execute',
          status: 'in-progress',
          client_id: userId || undefined,
          created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          technical_area: ['PostgreSQL', 'Database'],
          urgency: 'high',
          estimated_duration: 45,
          communication_preference: ['chat'],
          budget_range: '$$$'
        }
      ];
      
      // Simulate API delay
      setTimeout(() => {
        setTickets(mockTickets);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && userId) {
      fetchClientTickets();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, userId]);

  const handleClaimTicket = (ticketId: string) => {
    console.log('View ticket details:', ticketId);
    // In a real implementation, this would navigate to the ticket detail page
  };

  const handleRefresh = () => {
    fetchClientTickets();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Your Support Requests</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
          >
            Refresh
          </Button>
          <Button 
            size="sm"
            asChild
          >
            <Link to="/client/help">
              <Plus className="h-4 w-4 mr-1" />
              New Request
            </Link>
          </Button>
        </div>
      </div>
      
      <TicketListContainer
        filteredTickets={tickets}
        totalTickets={tickets.length}
        onClaimTicket={handleClaimTicket}
        userId={userId}
        isAuthenticated={isAuthenticated}
        onRefresh={handleRefresh}
      />
    </div>
  );
};

export default ClientTicketList;
