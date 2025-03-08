
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { HelpRequest } from '../types/helpRequest';
import Layout from '../components/Layout';
import TicketList from '../components/tickets/TicketList';
import TicketFilters from '../components/tickets/TicketFilters';
import { toast } from 'sonner';
import { useAuth } from '../contexts/auth';
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
  const { userId, userDetails } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is a developer
    if (userDetails && userDetails.user_type !== 'developer') {
      toast.error('Only developers can access the ticket dashboard');
      navigate('/');
      return;
    }

    fetchAllTickets();
  }, [userDetails, navigate]);

  useEffect(() => {
    applyFilters();
  }, [tickets, filters]);

  const fetchAllTickets = async () => {
    try {
      setIsLoading(true);
      
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
    if (!userId) {
      toast.error('You must be logged in to claim a ticket');
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

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Developer Dashboard</h1>
          <div className="flex items-center gap-2">
            <button 
              onClick={fetchAllTickets}
              className="px-4 py-2 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
            >
              Refresh Tickets
            </button>
          </div>
        </div>
        
        <TicketFilters 
          filters={filters} 
          onFilterChange={handleFilterChange} 
        />
        
        <TicketList 
          tickets={filteredTickets} 
          onClaimTicket={handleClaimTicket} 
          currentUserId={userId || ''} 
        />
      </div>
    </Layout>
  );
};

export default DeveloperDashboard;
