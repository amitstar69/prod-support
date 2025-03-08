
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

  // Add auto-refresh effect - fetch tickets every 30 seconds
  useEffect(() => {
    // Initial fetch
    fetchAllTickets();
    
    // Set up interval for periodic refresh
    const refreshInterval = setInterval(() => {
      console.log('Auto-refreshing tickets...');
      fetchAllTickets();
    }, 30000); // 30 seconds
    
    // Clean up interval on component unmount
    return () => clearInterval(refreshInterval);
  }, []);

  useEffect(() => {
    // If user is logged in and is a client, redirect them to client dashboard
    if (isAuthenticated && userType === 'client') {
      toast('You are logged in as a client. Redirecting to client dashboard.');
      navigate('/client-profile');
      return;
    }
  }, [isAuthenticated, userType, navigate]);

  useEffect(() => {
    applyFilters();
  }, [tickets, filters]);

  const fetchAllTickets = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching all tickets...');
      
      // Try multiple approaches to fetch tickets for maximum reliability
      let ticketsData: HelpRequest[] = [];
      
      // 1. First try the helper function approach
      console.log('Approach 1: Using getAllPublicHelpRequests helper');
      const response = await getAllPublicHelpRequests();
      
      if (response.success && response.data && response.data.length > 0) {
        console.log('Successfully fetched tickets via helper:', response.data.length);
        ticketsData = response.data;
      } else {
        console.log('Helper function returned no tickets or failed, trying direct query');
        
        // 2. Try direct Supabase query as backup
        console.log('Approach 2: Direct Supabase query');
        const { data, error } = await supabase
          .from('help_requests')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Direct query also failed:', error);
          toast.error('Failed to load tickets. Please try again.');
        } else if (data && data.length > 0) {
          console.log('Successfully fetched tickets via direct query:', data.length);
          ticketsData = data;
        } else {
          console.log('Direct query returned no tickets');
        }
      }
      
      // 3. Final fallback - check localStorage
      if (ticketsData.length === 0) {
        console.log('Approach 3: Checking localStorage as last resort');
        const localTickets = JSON.parse(localStorage.getItem('helpRequests') || '[]');
        if (localTickets.length > 0) {
          console.log('Found tickets in localStorage:', localTickets.length);
          ticketsData = localTickets;
        }
      }
      
      // Set tickets data if we found any through any method
      if (ticketsData.length > 0) {
        setTickets(ticketsData);
        console.log('Total tickets found across all methods:', ticketsData.length);
      } else {
        console.log('No tickets found through any method');
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

        {isLoading && tickets.length === 0 ? (
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
            onRefresh={fetchAllTickets}
          />
        )}
      </div>
    </Layout>
  );
};

export default DeveloperDashboard;
