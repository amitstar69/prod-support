
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Hero from '../components/Hero';
import DeveloperHero from '../components/DeveloperHero';
import PainPointsSection from '../components/PainPointsSection';
import HowItWorksSection from '../components/HowItWorksSection';
import TargetAudienceSection from '../components/TargetAudienceSection';
import DeveloperShowcase from '../components/DeveloperShowcase';
import CTASection from '../components/CTASection';
import { getFeaturedDevelopers, getOnlineDevelopers } from '../data/products';
import { useAuth } from '../contexts/auth';
import TicketListContainer from '../components/dashboard/TicketListContainer';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Search, Filter } from 'lucide-react';
import { useTicketFetching } from '../hooks/dashboard/useTicketFetching';
import { useTicketFilters } from '../hooks/dashboard/useTicketFilters';
import { useTicketApplications } from '../hooks/dashboard/useTicketApplications';

const Index: React.FC = () => {
  const { isAuthenticated, userId, userType } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [developers, setDevelopers] = useState<any[]>([]);
  const [contentLoaded, setContentLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // If user is authenticated as a developer, load ticket data
  const isDeveloper = isAuthenticated && userType === 'developer';
  
  // Get ticket fetching functionality
  const {
    tickets,
    isLoading: ticketsLoading,
    dataSource,
    fetchTickets,
    handleForceRefresh,
  } = useTicketFetching(isAuthenticated, userType);

  // Get filtering functionality
  const {
    filters,
    filteredTickets,
    showFilters,
    setShowFilters,
    handleFilterChange
  } = useTicketFilters(tickets);

  // Get applications functionality
  const {
    recommendedTickets,
    myApplications,
    handleClaimTicket,
    fetchMyApplications
  } = useTicketApplications(tickets, isAuthenticated, userId, userType, fetchTickets);

  // Filter tickets based on search query
  const searchedTickets = filteredTickets.filter(ticket => 
    ticket.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    ticket.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.technical_area?.some((area: string) => 
      area.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );
  
  useEffect(() => {
    console.log('Index page mounted');
    
    // Track page load performance
    const startTime = performance.now();
    
    // Set loading state
    setIsLoading(true);
    
    // Load featured developers immediately to avoid empty state
    const featuredDevelopers = getFeaturedDevelopers();
    setDevelopers(featuredDevelopers);
    
    // Set a shorter timeout for better UX
    const loadTimeout = setTimeout(() => {
      if (isLoading && !contentLoaded) {
        console.log('Using cached featured developers data');
        setIsLoading(false);
        setContentLoaded(true);
      }
    }, 2000); // Reduced from 5000ms to 2000ms
    
    // Attempt to get online developers
    try {
      const onlineDevelopers = getOnlineDevelopers().slice(0, 4);
      
      if (onlineDevelopers.length > 0) {
        setDevelopers(onlineDevelopers);
      }
      
      setIsLoading(false);
      setContentLoaded(true);
      
      // Log performance metrics
      const loadTime = performance.now() - startTime;
      console.log(`Index page loaded in ${loadTime.toFixed(0)}ms`);
    } catch (error) {
      console.error('Error loading developer data:', error);
      // We already set featured developers as fallback, so just log the error
      setIsLoading(false);
      setContentLoaded(true);
    }
    
    // If user is a developer, fetch ticket data
    if (isDeveloper) {
      fetchTickets();
    }
    
    return () => {
      clearTimeout(loadTimeout);
    };
  }, [isAuthenticated, userId, userType]);
  
  // Check if user is a client - if so, redirect to client dashboard
  useEffect(() => {
    if (isAuthenticated && userType === 'client') {
      navigate('/client-dashboard');
    }
  }, [isAuthenticated, userType, navigate]);
  
  return (
    <Layout>
      {isDeveloper ? (
        <>
          <DeveloperHero />
          <div className="container mx-auto py-10 px-4">
            <div className="mb-8 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Available Help Requests</h2>
              <p className="text-lg text-muted-foreground">
                Browse and apply for help requests that match your expertise
              </p>
            </div>
            
            <div className="relative mb-8 max-w-2xl mx-auto">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search for tickets by title, description, or tech stack..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
                <Button onClick={() => navigate('/developer-dashboard')}>
                  Full Dashboard
                </Button>
              </div>
            </div>
            
            <div className="bg-muted/20 p-6 rounded-lg border border-border/30 mb-8">
              <TicketListContainer
                filteredTickets={searchQuery ? searchedTickets : (recommendedTickets.length > 0 ? recommendedTickets : filteredTickets.slice(0, 5))}
                totalTickets={tickets.length}
                onClaimTicket={handleClaimTicket}
                userId={userId}
                isAuthenticated={isAuthenticated}
                onRefresh={handleForceRefresh}
              />
              
              <div className="mt-4 text-center">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/developer-dashboard')}
                >
                  View All Tickets
                </Button>
              </div>
            </div>
            
            <div className="bg-muted/20 p-6 rounded-lg border border-border/30">
              <h2 className="text-xl font-semibold mb-4">Your Applications</h2>
              {myApplications.length > 0 ? (
                <TicketListContainer
                  filteredTickets={myApplications.slice(0, 3)}
                  totalTickets={myApplications.length}
                  onClaimTicket={handleClaimTicket}
                  userId={userId}
                  isAuthenticated={isAuthenticated}
                />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>You haven't applied to any help requests yet.</p>
                  <p className="mt-2">Browse available tickets and start applying!</p>
                </div>
              )}
              
              {myApplications.length > 3 && (
                <div className="mt-4 text-center">
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/developer-dashboard')}
                  >
                    View All Your Applications
                  </Button>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          <Hero />
          {contentLoaded || !isLoading ? (
            <DeveloperShowcase developers={developers} />
          ) : (
            <div className="py-8 text-center">
              <div className="animate-pulse mx-auto max-w-6xl px-4">
                <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
                <div className="flex flex-wrap justify-center gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-64 w-64 bg-gray-200 rounded-lg"></div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <PainPointsSection />
          <HowItWorksSection />
          <TargetAudienceSection />
          <CTASection />
        </>
      )}
    </Layout>
  );
};

export default Index;
