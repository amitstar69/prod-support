
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { HelpRequest } from '../types/helpRequest';
import Layout from '../components/Layout';
import { toast } from 'sonner';
import { useAuth } from '../contexts/auth';
import { getAllPublicHelpRequests, testHelpRequestsTableAccess } from '../integrations/supabase/helpRequests';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import LoginPrompt from '../components/dashboard/LoginPrompt';
import TicketFiltersContainer from '../components/dashboard/TicketFiltersContainer';
import TicketList from '../components/tickets/TicketList';
import { Loader2, ArrowDown, RotateCw } from 'lucide-react';
import { Button } from '../components/ui/button';

// Sample demo data to display if no tickets are found or for non-authenticated users
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
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const { isAuthenticated, userId, userType } = useAuth();
  const navigate = useNavigate();

  // Add auto-refresh effect - fetch tickets every 30 seconds
  useEffect(() => {
    // Initial fetch
    fetchAllTickets();
    
    // Debug the database access if we're authenticated but not seeing requests
    if (isAuthenticated) {
      testDatabaseAccess();
    }
    
    // Set up interval for periodic refresh
    const refreshInterval = setInterval(() => {
      console.log('Auto-refreshing tickets...');
      fetchAllTickets(false); // Don't show loading indicator for auto-refresh
    }, 30000); // 30 seconds
    
    // Clean up interval on component unmount
    return () => clearInterval(refreshInterval);
  }, [isAuthenticated]); // Re-run when authentication status changes

  useEffect(() => {
    // If user is logged in and is a client, redirect them to client dashboard
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
      
      // Get help requests - pass authentication status
      const response = await getAllPublicHelpRequests(isAuthenticated);
      
      if (response.success && response.data) {
        console.log('Successfully fetched tickets:', response.data.length);
        
        if (response.data.length > 0) {
          setTickets(response.data);
        } else {
          // For authenticated users with no tickets, show empty state
          if (isAuthenticated) {
            setTickets([]);
            
            if (showLoading) {
              toast.info('No help requests found. New requests will appear here.', {
                duration: 5000
              });
            }
          } else {
            // For non-authenticated users with no data, use demo tickets
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
        
        // Only use demo data for non-authenticated users
        if (!isAuthenticated) {
          setTickets(DEMO_TICKETS);
          
          if (showLoading) {
            toast.info('Showing demo data. Sign in to see real help requests.', {
              duration: 5000
            });
          }
        } else {
          // For authenticated users with no tickets or errors, show empty state
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
      toast.loading('Claiming ticket...');
      
      // Don't allow claiming demo tickets when authenticated
      if ((ticketId.startsWith('demo-') || ticketId.startsWith('help-')) && isAuthenticated) {
        toast.error('Cannot claim demo tickets. Please apply to real help requests.');
        return;
      }
      
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

  const handleForceRefresh = () => {
    // Clear local storage help requests to remove any stale data
    localStorage.removeItem('helpRequests');
    toast.success('Local cache cleared. Refreshing data...');
    fetchAllTickets();
  };

  return (
    <Layout>
      <div className="bg-secondary/30 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">Developer Dashboard</h1>
          <p className="text-muted-foreground">
            Browse and claim help requests from clients looking for technical assistance
          </p>
        </div>
      </div>
      
      <div className="container mx-auto py-8 px-4">
        <DashboardHeader 
          showFilters={showFilters} 
          setShowFilters={setShowFilters} 
          onRefresh={fetchAllTickets} 
        />
        
        {!isAuthenticated && (
          <div className="mb-8">
            <LoginPrompt />
          </div>
        )}
        
        {isAuthenticated && (
          <div className="mb-4 flex justify-end">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleForceRefresh}
              className="flex items-center gap-1"
            >
              <RotateCw className="h-4 w-4" />
              Force Refresh
            </Button>
          </div>
        )}
        
        {showFilters && (
          <div className="mb-6">
            <TicketFiltersContainer 
              filters={filters} 
              onFilterChange={handleFilterChange} 
            />
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-lg">Loading tickets...</span>
          </div>
        ) : filteredTickets.length > 0 ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {isAuthenticated ? 'Available Help Requests' : 'Demo Help Requests'}
              </h2>
              <div className="text-sm text-muted-foreground">
                Showing {filteredTickets.length} of {tickets.length} tickets
              </div>
            </div>
            <TicketList 
              tickets={filteredTickets} 
              onClaimTicket={handleClaimTicket}
              currentUserId={userId}
              isAuthenticated={isAuthenticated}
            />
            
            {filteredTickets.length >= 5 && (
              <div className="flex justify-center mt-6">
                <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <ArrowDown className="h-4 w-4" />
                  Show more
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white p-8 rounded-lg border border-border/40 text-center">
            <div className="h-12 w-12 mx-auto text-muted-foreground mb-4">📋</div>
            <h3 className="text-xl font-medium mb-2">No help requests found</h3>
            <p className="text-muted-foreground mb-4">
              {tickets.length > 0 
                ? "There are no tickets matching your current filters. Try adjusting your filters."
                : isAuthenticated 
                  ? "There are no active help requests at the moment. Check back later."
                  : "Sign in as a developer to see real help requests from clients."}
            </p>
            <button 
              onClick={() => fetchAllTickets()}
              className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            >
              Refresh Requests
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default DeveloperDashboard;
