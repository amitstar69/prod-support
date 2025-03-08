
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { HelpRequest } from '../types/helpRequest';
import Layout from '../components/Layout';
import { toast } from 'sonner';
import { useAuth } from '../contexts/auth';
import { getAllPublicHelpRequests } from '../integrations/supabase/helpRequests';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import LoginPrompt from '../components/dashboard/LoginPrompt';
import TicketFiltersContainer from '../components/dashboard/TicketFiltersContainer';
import TicketListContainer from '../components/dashboard/TicketListContainer';
import { Loader2 } from 'lucide-react';

const DeveloperDashboard = () => {
  const [tickets, setTickets] = useState<HelpRequest[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<HelpRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    technicalArea: 'all',
    urgency: 'all',
  });
  const [showFilters, setShowFilters] = useState(false);
  const { isAuthenticated, userId, userType } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is logged in and is a client, redirect them to client dashboard
    if (isAuthenticated && userType === 'client') {
      toast('You are logged in as a client. Redirecting to client dashboard.');
      navigate('/client-profile');
      return;
    }

    fetchAllTickets();
  }, [isAuthenticated, userType, navigate]);

  useEffect(() => {
    applyFilters();
  }, [tickets, filters]);

  const fetchAllTickets = async () => {
    try {
      setIsLoading(true);
      
      // Fetch all help requests without filtering by user ID
      const { data, error } = await supabase
        .from('help_requests')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching tickets:', error);
        toast.error('Failed to load tickets. Please try again.');
        setTickets([]);
      } else {
        console.log('Tickets fetched:', data);
        setTickets(data || []);
      }
    } catch (error) {
      console.error('Exception fetching tickets:', error);
      toast.error('Unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...tickets];
    
    // Apply status filter
    if (filters.status !== 'all') {
      result = result.filter(ticket => ticket.status === filters.status);
    }
    
    // Apply technical area filter
    if (filters.technicalArea !== 'all') {
      result = result.filter(ticket => 
        ticket.technical_area && ticket.technical_area.includes(filters.technicalArea)
      );
    }
    
    // Apply urgency filter
    if (filters.urgency !== 'all') {
      result = result.filter(ticket => ticket.urgency === filters.urgency);
    }
    
    setFilteredTickets(result);
  };

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
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

    try {
      // First create a match record
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
      
      // Then update the help request status
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
      fetchAllTickets(); // Refresh the ticket list
    } catch (error) {
      console.error('Exception claiming ticket:', error);
      toast.error('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <DashboardHeader 
          showFilters={showFilters} 
          setShowFilters={setShowFilters} 
          onRefresh={fetchAllTickets} 
        />
        
        {!isAuthenticated && <LoginPrompt />}
        
        {showFilters && (
          <TicketFiltersContainer 
            filters={filters} 
            onFilterChange={handleFilterChange} 
          />
        )}

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-lg">Loading tickets...</span>
          </div>
        ) : (
          <TicketListContainer 
            filteredTickets={filteredTickets} 
            totalTickets={tickets.length}
            onClaimTicket={handleClaimTicket}
            userId={userId}
            isAuthenticated={isAuthenticated}
          />
        )}
      </div>
    </Layout>
  );
};

export default DeveloperDashboard;
