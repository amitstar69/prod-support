
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { HelpRequest } from '../types/helpRequest';
import Layout from '../components/Layout';
import TicketList from '../components/tickets/TicketList';
import TicketFilters from '../components/tickets/TicketFilters';
import { toast } from 'sonner';
import { useAuth } from '../contexts/auth';
import { Loader2, LayoutGrid, PlusCircle, ArrowDownUp, Filter, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/button';

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
  const { userId, userType } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is a developer
    if (userType !== 'developer') {
      toast.error('Only developers can access the ticket dashboard');
      navigate('/');
      return;
    }

    fetchAllTickets();
  }, [userType, navigate]);

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
          <div>
            <h1 className="text-2xl font-bold">Developer Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Browse and claim available help requests from clients
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
            <Button 
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              onClick={fetchAllTickets}
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>
        
        {showFilters && (
          <div className="mb-6 p-4 bg-muted/30 border border-border/30 rounded-md">
            <TicketFilters 
              filters={filters} 
              onFilterChange={handleFilterChange} 
            />
          </div>
        )}

        <div className="bg-white rounded-md shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-border/30 p-3 bg-muted/20">
            <div className="text-sm text-muted-foreground">
              Showing {filteredTickets.length} of {tickets.length} tickets
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                className="text-xs flex items-center gap-1"
              >
                <ArrowDownUp className="h-3 w-3" />
                Sort
              </Button>
            </div>
          </div>
        
          <TicketList 
            tickets={filteredTickets} 
            onClaimTicket={handleClaimTicket} 
            currentUserId={userId || ''} 
          />
        </div>
      </div>
    </Layout>
  );
};

export default DeveloperDashboard;
