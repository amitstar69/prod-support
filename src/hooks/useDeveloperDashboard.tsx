
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '../integrations/supabase/client';
import { HelpRequest } from '../types/helpRequest';
import { getAllPublicHelpRequests, testHelpRequestsTableAccess } from '../integrations/supabase/helpRequests';
import { useAuth } from '../contexts/auth';

// Demo tickets for fallback
const DEMO_TICKETS: HelpRequest[] = [
  {
    id: 'demo-1',
    client_id: 'demo-client-1',
    title: 'Fix React Router Navigation Bug',
    description: 'Our React application is experiencing navigation issues when using nested routes. Users cannot navigate back correctly and sometimes the URL changes but the content doesn\'t update.',
    technical_area: ['Frontend', 'React', 'React Router'],
    urgency: 'medium',
    communication_preference: ['Chat', 'Video Call'],
    estimated_duration: 45,
    budget_range: '$50 - $100',
    code_snippet: 'import { BrowserRouter, Routes, Route } from "react-router-dom";\n\nfunction App() {\n  return (\n    <BrowserRouter>\n      <Routes>\n        <Route path="/" element={<Home />} />\n        <Route path="dashboard/*" element={<Dashboard />} />\n      </Routes>\n    </BrowserRouter>\n  );\n}',
    status: 'pending',
    created_at: new Date().toISOString()
  },
  {
    id: 'demo-2',
    client_id: 'demo-client-1',
    title: 'Database Query Optimization',
    description: 'Our PostgreSQL queries are running slow on larger datasets. Need help optimizing the query performance for our listing page that shows thousands of products.',
    technical_area: ['Backend', 'Database', 'SQL'],
    urgency: 'high',
    communication_preference: ['Chat', 'Screen Sharing'],
    estimated_duration: 60,
    budget_range: '$100 - $200',
    code_snippet: 'SELECT p.*, c.name as category_name, AVG(r.rating) as avg_rating\nFROM products p\nJOIN categories c ON p.category_id = c.id\nLEFT JOIN reviews r ON p.id = r.product_id\nWHERE p.is_active = true\nGROUP BY p.id, c.name\nORDER BY created_at DESC\nLIMIT 50 OFFSET 0;',
    status: 'pending',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() // 2 hours ago
  },
  {
    id: 'demo-3',
    client_id: 'demo-client-2',
    title: 'Implement Stripe Payment Integration',
    description: 'Need help integrating Stripe payment processing into our React/Node.js e-commerce application. We want to accept credit cards and Apple Pay.',
    technical_area: ['Full Stack', 'API Integration', 'Payment Processing'],
    urgency: 'medium',
    communication_preference: ['Video Call', 'Screen Sharing'],
    estimated_duration: 90,
    budget_range: '$200 - $500',
    code_snippet: 'const stripe = require("stripe")("sk_test_...");\n\nasync function createPaymentIntent(req, res) {\n  try {\n    const paymentIntent = await stripe.paymentIntents.create({\n      amount: 1000,\n      currency: "usd"\n    });\n    res.status(200).json({ clientSecret: paymentIntent.client_secret });\n  } catch (err) {\n    res.status(500).json({ error: err.message });\n  }\n}',
    status: 'pending',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() // 1 day ago
  }
];

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
          setTickets(response.data);
        } else {
          if (isAuthenticated) {
            setTickets([]);
            
            if (showLoading) {
              toast.info('No help requests found. New requests will appear here.', {
                duration: 5000
              });
            }
          } else {
            setTickets(DEMO_TICKETS);
            
            if (showLoading) {
              toast.info('Showing demo data. Sign in to see real help requests.', {
                duration: 5000
              });
            }
          }
        }
      } else {
        console.log('Fetch failed or returned no data, handling fallback');
        
        if (!isAuthenticated) {
          setTickets(DEMO_TICKETS);
          
          if (showLoading) {
            toast.info('Showing demo data. Sign in to see real help requests.', {
              duration: 5000
            });
          }
        } else {
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
      }
    } catch (error) {
      console.error('Exception fetching tickets:', error);
      
      if (showLoading) {
        if (!isAuthenticated) {
          toast.error('Error loading tickets. Showing demo data instead.');
          setTickets(DEMO_TICKETS);
        } else {
          toast.error('Error loading tickets. Please try again later.');
          setTickets([]);
        }
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
