
import { useState, useEffect, useCallback } from 'react';
import { HelpRequest } from '../../types/helpRequest';
import { useAuth } from '../../contexts/auth';
import { supabase, getAllPublicHelpRequests, testDatabaseAccess } from '../../integrations/supabase/client';
import { toast } from 'sonner';
import { generateSampleDeveloperDashboardData } from './sampleData';
import { useTicketFilters } from './useTicketFilters';
import { useTicketApplications } from './useTicketApplications';
import { useTicketFetching } from './useTicketFetching';
import { Developer } from '../../types/product';
import { isLocalId } from '../../integrations/supabase/helpRequestsUtils';

export const useDeveloperDashboard = () => {
  const { isAuthenticated, userId, userType } = useAuth();
  const [tickets, setTickets] = useState<HelpRequest[]>([]);
  const [dataSource, setDataSource] = useState<'local' | 'database' | 'error'>('local');
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(isAuthenticated ? 'recommended' : 'all');
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [isLoadingDevelopers, setIsLoadingDevelopers] = useState(false);
  
  // Use custom hooks for ticket filtering, applications, and fetching
  const { filters, handleFilterChange, applyFilters } = useTicketFilters();
  const { myApplications, checkIfApplied, fetchMyApplications } = useTicketApplications(userId);
  const { 
    isLoading,
    errorMessage,
    fetchTickets: baseFetchTickets,
    recommendTickets
  } = useTicketFetching(isAuthenticated, userId);
  
  // Fetch developers data for matching
  const fetchDevelopers = useCallback(async () => {
    if (!isAuthenticated) {
      // For demo, use mock developers from localStorage
      const localDevs = JSON.parse(localStorage.getItem('mockDevelopers') || '[]');
      setDevelopers(localDevs.length > 0 ? localDevs : generateSampleDeveloperDashboardData().developers);
      return;
    }
    
    setIsLoadingDevelopers(true);
    
    try {
      const { data, error } = await supabase
        .from('developer_profiles')
        .select(`
          *,
          profiles:id (
            name,
            image,
            description,
            username,
            location
          )
        `);
        
      if (error) {
        console.error('Error fetching developers:', error);
        toast.error('Failed to load developer profiles');
        setDevelopers([]);
        return;
      }
      
      // Transform data to match Developer interface
      const formattedDevelopers: Developer[] = data.map((dev: any) => ({
        id: dev.id,
        name: dev.profiles?.name || 'Unknown Developer',
        hourlyRate: dev.hourly_rate || 0,
        minuteRate: dev.minute_rate || 0,
        image: dev.profiles?.image || '/placeholder.svg',
        category: dev.category || 'general',
        skills: dev.skills || [],
        experience: dev.experience || 'Not specified',
        description: dev.profiles?.description || '',
        rating: dev.rating || 0,
        availability: dev.availability || false,
        online: dev.online || false,
        username: dev.profiles?.username || '',
        location: dev.profiles?.location || '',
        featured: dev.featured || false,
        lastActive: dev.last_active ? new Date(dev.last_active).toISOString() : undefined,
        communicationPreferences: dev.communication_preferences || []
      }));
      
      setDevelopers(formattedDevelopers);
    } catch (err) {
      console.error('Error in fetchDevelopers:', err);
      toast.error('Error loading developer profiles');
      setDevelopers([]);
    } finally {
      setIsLoadingDevelopers(false);
    }
  }, [isAuthenticated]);
  
  // Enhanced fetch tickets method that also fetches applications and developers
  const fetchTickets = useCallback(async () => {
    if (!isAuthenticated) {
      // Use sample data for non-authenticated users
      console.log('Using sample data for non-authenticated user');
      const sampleData = generateSampleDeveloperDashboardData();
      setTickets(sampleData.tickets);
      setDevelopers(sampleData.developers);
      setDataSource('local');
      return { success: true, data: sampleData.tickets, source: 'local' };
    }
    
    // Fetch real data for authenticated users
    const result = await baseFetchTickets(true); // Pass true for showLoading parameter
    
    if (result.success) {
      setTickets(result.data);
      setDataSource(result.source as 'local' | 'database' | 'error');
      
      // Fetch applications if authenticated
      await fetchMyApplications(userId); // Pass userId as the required argument
      
      // Fetch developers for matching
      await fetchDevelopers();
      
      return result;
    } else {
      setDataSource('error');
      toast.error(`Error loading tickets: ${result.error}`);
      return result;
    }
  }, [isAuthenticated, userId, baseFetchTickets, fetchMyApplications, fetchDevelopers]);
  
  // Run on initial load
  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);
  
  // Apply filters to tickets
  const filteredTickets = applyFilters(tickets);
  
  // Get recommended tickets for the current user
  const recommendedTickets = recommendTickets(tickets, userId);
  
  // Handle claiming a ticket
  const handleClaimTicket = async (ticketId: string) => {
    if (!isAuthenticated) {
      toast.error('You must be logged in to claim tickets');
      return;
    }
    
    if (userType !== 'developer') {
      toast.error('Only developers can claim tickets');
      return;
    }
    
    // Check if already applied
    const hasApplied = checkIfApplied(ticketId);
    if (hasApplied) {
      toast.info('You have already applied to this ticket');
      return;
    }
    
    // Navigate to ticket details page
    window.location.href = `/get-help/request/${ticketId}`;
  };
  
  // Force refresh data
  const handleForceRefresh = async () => {
    await fetchTickets();
    toast.success('Data refreshed');
  };
  
  // Debug functions
  const debugAuthStatus = () => {
    const authState = JSON.parse(localStorage.getItem('authState') || '{}');
    const sessionData = JSON.parse(sessionStorage.getItem('sessionData') || '{}');
    
    toast.info(`Auth Status: ${isAuthenticated ? 'Authenticated' : 'Not Authenticated'}`);
    console.log('Auth state from localStorage:', authState);
    console.log('Session data from sessionStorage:', sessionData);
    
    if (isAuthenticated) {
      console.log('Current user ID:', userId);
      console.log('Current user type:', userType);
    }
    
    // Check if user ID looks valid
    if (userId) {
      if (isLocalId(userId)) {
        toast.info('You are using a local demo user ID');
      } else {
        toast.info('You have a valid Supabase user ID');
      }
    }
  };
  
  // Test database access directly
  const runDatabaseTest = async () => {
    toast.info('Testing database access...');
    const result = await testDatabaseAccess();
    console.log('Database test result:', result);
    
    if (result.success) {
      toast.success(`Database connection successful. Found ${result.count} tickets.`);
    } else {
      toast.error(`Database test failed: ${result.error?.message || 'Unknown error'}`);
    }
  };
  
  return {
    tickets,
    filteredTickets,
    recommendedTickets,
    myApplications,
    developers,
    isLoading: isLoading || isLoadingDevelopers,
    errorMessage,
    filters,
    showFilters,
    setShowFilters,
    isAuthenticated,
    userId,
    activeTab,
    setActiveTab,
    dataSource,
    handleFilterChange,
    handleClaimTicket,
    handleForceRefresh,
    fetchTickets,
    // Debug functions
    debugAuthStatus,
    runDatabaseTest
  };
};
