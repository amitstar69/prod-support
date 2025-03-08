import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '../integrations/supabase/client';
import { HelpRequest } from '../types/helpRequest';
import { getAllPublicHelpRequests, testHelpRequestsTableAccess } from '../integrations/supabase/helpRequests';
import { useAuth } from '../contexts/auth';

export const useDeveloperDashboard = () => {
  const [tickets, setTickets] = useState<HelpRequest[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<HelpRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    technicalArea: 'all',
    urgency: 'all',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const { isAuthenticated, userId, userType } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllTickets();
    
    if (isAuthenticated) {
      testDatabaseAccess();
    }
    
    const refreshInterval = setInterval(() => {
      console.log('Auto-refreshing tickets...');
      fetchAllTickets(false);
    }, 30000);
    
    return () => clearInterval(refreshInterval);
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && userType === 'client') {
      toast('You are logged in as a client. Redirecting to client dashboard.');
      navigate('/client-dashboard');
      return;
    }
  }, [isAuthenticated, userType, navigate]);

  useEffect(() => {
    applyFilters();
  }, [tickets, filters]);

  const testDatabaseAccess = async () => {
    try {
      const result = await testHelpRequestsTableAccess();
      console.log('Database access test result:', result);
      setDebugInfo(result);
      
      if (!result.success && result.authenticated) {
        toast.error('Database access issue detected. This may affect what tickets you can see.');
      }
    } catch (error) {
      console.error('Error testing database access:', error);
    }
  };

  const fetchAllTickets = async (showLoading = true) => {
    try {
      if (showLoading) {
        setIsLoading(true);
      }
      console.log('Fetching all tickets...');
      
      const response = await getAllPublicHelpRequests(isAuthenticated);
      
      if (response.success && response.data) {
        console.log('Successfully fetched tickets:', response.data.length);
        
        if (response.data.length > 0) {
          // We have real data from the database
          setTickets(response.data);
          
          if (showLoading && !isAuthenticated) {
            toast.info('Showing all available help requests', {
              duration: 3000
            });
          }
        } else {
          // No data from database
          setTickets([]);
          
          if (showLoading) {
            toast.info('No help requests found. New requests will appear here.', {
              duration: 5000
            });
          }
        }
      } else {
        console.log('Fetch failed or returned no data');
        setTickets([]);
        
        if (showLoading && response.error) {
          toast.error(`Error loading tickets: ${response.error}`, {
            duration: 5000
          });
        } else if (showLoading) {
          toast.info('No help requests found. New requests will appear here.', {
            duration: 5000
          });
        }
      }
    } catch (error) {
      console.error('Exception fetching tickets:', error);
      
      if (showLoading) {
        toast.error('Error loading tickets. Please try again later.');
        setTickets([]);
      }
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  };

  const applyFilters = () => {
    let result = [...tickets];
    
    if (filters.status !== 'all') {
      result = result.filter(ticket => ticket.status === filters.status);
    }
    
    if (filters.technicalArea !== 'all') {
      result = result.filter(ticket => 
        ticket.technical_area && ticket.technical_area.includes(filters.technicalArea)
      );
    }
    
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
      toast.loading('Claiming ticket...');
      
      if ((ticketId.startsWith('demo-') || ticketId.startsWith('help-')) && isAuthenticated) {
        toast.error('Cannot claim demo tickets. Please apply to real help requests.');
        return;
      }
      
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
      fetchAllTickets();
    } catch (error) {
      console.error('Exception claiming ticket:', error);
      toast.error('An unexpected error occurred. Please try again.');
    }
  };

  const handleForceRefresh = () => {
    localStorage.removeItem('helpRequests');
    toast.success('Local cache cleared. Refreshing data...');
    fetchAllTickets();
  };

  return {
    tickets,
    filteredTickets,
    isLoading,
    filters,
    showFilters,
    setShowFilters,
    isAuthenticated,
    userId,
    handleFilterChange,
    handleClaimTicket,
    handleForceRefresh,
    fetchAllTickets
  };
};
