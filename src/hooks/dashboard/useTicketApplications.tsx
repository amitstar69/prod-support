
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../integrations/supabase/client';
import { HelpRequest } from '../../types/helpRequest';

export interface UseTicketApplicationsResult {
  recommendedTickets: HelpRequest[];
  myApplications: HelpRequest[];
  handleClaimTicket: (ticketId: string) => Promise<void>;
  fetchMyApplications: () => Promise<void>;
}

export const useTicketApplications = (
  tickets: HelpRequest[],
  isAuthenticated: boolean,
  userId: string | null,
  userType: string | null,
  fetchTickets: () => Promise<void>
): UseTicketApplicationsResult => {
  const [recommendedTickets, setRecommendedTickets] = useState<HelpRequest[]>([]);
  const [myApplications, setMyApplications] = useState<HelpRequest[]>([]);
  const navigate = useNavigate();

  // Effect to set recommended tickets and fetch applications
  useEffect(() => {
    if (isAuthenticated && tickets.length > 0) {
      // Generate recommended tickets based on matching criteria
      // For now, we'll just take the 3 most recent tickets as recommended
      const sorted = [...tickets].sort((a, b) => {
        return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
      });
      
      setRecommendedTickets(sorted.slice(0, 3));
      
      // Get tickets that this developer has applied for
      fetchMyApplications();
    } else {
      setRecommendedTickets([]);
      setMyApplications([]);
    }
  }, [tickets, isAuthenticated, userId]);

  const fetchMyApplications = async () => {
    if (!isAuthenticated || !userId) return;
    
    try {
      // Check in localStorage first for sample data
      const localMatches = JSON.parse(localStorage.getItem('help_request_matches') || '[]');
      const myLocalApplicationIds = localMatches
        .filter((match: any) => match.developer_id === userId)
        .map((match: any) => match.request_id);
        
      const myLocalApplications = tickets.filter(ticket => 
        myLocalApplicationIds.includes(ticket.id)
      );
      
      // Check in database for real applications
      if (supabase) {
        const { data: matchData, error } = await supabase
          .from('help_request_matches')
          .select('request_id, status, proposed_message, proposed_duration, proposed_rate')
          .eq('developer_id', userId);
          
        if (error) {
          console.error('Error fetching applications:', error);
          setMyApplications(myLocalApplications);
          return;
        }
        
        if (matchData && matchData.length > 0) {
          const databaseApplicationIds = matchData.map(match => match.request_id);
          
          // Find corresponding tickets
          const myDatabaseApplications = tickets.filter(ticket => 
            databaseApplicationIds.includes(ticket.id)
          );
          
          // Combine local and database applications
          setMyApplications([...myDatabaseApplications, ...myLocalApplications]);
        } else {
          setMyApplications(myLocalApplications);
        }
      } else {
        setMyApplications(myLocalApplications);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      setMyApplications([]);
    }
  };

  const handleClaimTicket = async (ticketId: string) => {
    if (!isAuthenticated) {
      toast.error('You must be logged in to claim a ticket');
      navigate('/login', { state: { returnTo: '/developer-dashboard' } });
      return;
    }

    if (userType !== 'developer') {
      toast.error('Only developers can claim tickets');
      return;
    }

    // Don't allow claiming sample tickets
    if (ticketId.startsWith('sample-')) {
      toast.error('This is a sample ticket. Sign in to claim real help requests.');
      return;
    }

    try {
      toast.loading('Claiming ticket...');
      
      const { data: matchData, error: matchError } = await supabase
        .from('help_request_matches')
        .insert({
          request_id: ticketId,
          developer_id: userId,
          status: 'accepted'
        })
        .select('*')
        .single();
      
      if (matchError) {
        console.error('Error claiming ticket:', matchError);
        toast.error('Failed to claim ticket. Please try again.');
        return;
      }
      
      const { error: updateError } = await supabase
        .from('help_requests')
        .update({ status: 'in-progress' })
        .eq('id', ticketId);
      
      if (updateError) {
        console.error('Error updating ticket status:', updateError);
        toast.error('Failed to update ticket status. Please try again.');
        return;
      }
      
      toast.success('Ticket claimed successfully!');
      fetchTickets();
    } catch (error) {
      console.error('Exception claiming ticket:', error);
      toast.error('An unexpected error occurred. Please try again.');
    }
  };

  return {
    recommendedTickets,
    myApplications,
    handleClaimTicket,
    fetchMyApplications
  };
};
