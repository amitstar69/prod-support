
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '../integrations/supabase/client';
import { HelpRequest } from '../types/helpRequest';
import { getAllPublicHelpRequests } from '../integrations/supabase/helpRequests';
import { useAuth } from '../contexts/auth';

// Sample tickets to show for non-authenticated users
const sampleTickets: HelpRequest[] = [
  {
    id: 'sample-1',
    client_id: 'demo-client',
    title: 'React Component Optimization',
    description: 'I have a React application with performance issues. Need help identifying and fixing components that are causing re-renders.',
    technical_area: ['Frontend', 'React', 'Performance Optimization'],
    urgency: 'medium',
    communication_preference: ['Video Call', 'Screen Sharing'],
    estimated_duration: 60,
    budget_range: '$50 - $100',
    status: 'pending',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    code_snippet: 'function MyComponent() { const [state, setState] = useState(0); // More code here }'
  },
  {
    id: 'sample-2',
    client_id: 'demo-client',
    title: 'API Integration Help Needed',
    description: 'Need assistance integrating a third-party payment API into my Node.js backend. Documentation is confusing.',
    technical_area: ['Backend', 'API Integration', 'Node.js'],
    urgency: 'high',
    communication_preference: ['Chat', 'Voice Call'],
    estimated_duration: 90,
    budget_range: '$100 - $200',
    status: 'pending',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days ago
  },
  {
    id: 'sample-3',
    client_id: 'demo-client',
    title: 'Database Query Optimization',
    description: 'PostgreSQL queries running slow in production. Need help optimizing and adding proper indexes.',
    technical_area: ['Database', 'SQL', 'Performance Optimization'],
    urgency: 'critical',
    communication_preference: ['Video Call', 'Screen Sharing'],
    estimated_duration: 120,
    budget_range: '$200 - $500',
    status: 'matching',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
  },
  {
    id: 'sample-4',
    client_id: 'demo-client',
    title: 'Help with AWS Deployment',
    description: 'Need assistance setting up CI/CD pipeline for a React application on AWS. Having issues with S3 and CloudFront configuration.',
    technical_area: ['DevOps', 'AWS', 'CI/CD'],
    urgency: 'medium',
    communication_preference: ['Video Call', 'Screen Sharing'],
    estimated_duration: 150,
    budget_range: '$100 - $200',
    status: 'pending',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
  },
  {
    id: 'sample-5',
    client_id: 'demo-client',
    title: 'React Native Animation Bug',
    description: 'Having issues with complex animations in a React Native app. Need help debugging and fixing jerky animations.',
    technical_area: ['Mobile Development', 'React Native', 'Animation'],
    urgency: 'high',
    communication_preference: ['Chat', 'Screen Sharing'],
    estimated_duration: 75,
    budget_range: '$50 - $100',
    status: 'pending',
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString() // 6 days ago
  }
];

export const useDeveloperDashboard = () => {
  const [tickets, setTickets] = useState<HelpRequest[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<HelpRequest[]>([]);
  const [recommendedTickets, setRecommendedTickets] = useState<HelpRequest[]>([]);
  const [myApplications, setMyApplications] = useState<HelpRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    technicalArea: 'all',
    urgency: 'all',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [dataSource, setDataSource] = useState<string>('sample');
  const { isAuthenticated, userId, userType } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTickets();
    
    const refreshInterval = setInterval(() => {
      console.log('Auto-refreshing tickets...');
      fetchTickets(false);
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

  const fetchTickets = async (showLoading = true) => {
    try {
      if (showLoading) {
        setIsLoading(true);
      }
      
      // For non-authenticated users, show sample tickets
      if (!isAuthenticated) {
        console.log('User not authenticated, showing sample tickets');
        setTickets(sampleTickets);
        setDataSource('sample');
        if (showLoading) {
          toast.info('Showing sample help requests. Sign in to see real tickets.', {
            duration: 5000
          });
        }
      } else {
        // For authenticated users, fetch real tickets from the database
        console.log('User authenticated, fetching real tickets');
        const response = await getAllPublicHelpRequests();
        
        if (response.success && response.data && response.data.length > 0) {
          console.log('Successfully fetched tickets:', response.data.length);
          setTickets(response.data);
          setDataSource('database');
        } else {
          console.log('No database tickets found or fetch failed');
          setTickets([]);
          
          if (showLoading && response.error) {
            toast.error(`Error loading tickets: ${response.error}`, {
              duration: 5000
            });
          }
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

  const handleForceRefresh = () => {
    toast.success('Refreshing data...');
    fetchTickets();
  };

  return {
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
    dataSource,
    handleFilterChange,
    handleClaimTicket,
    handleForceRefresh,
    fetchTickets
  };
};
