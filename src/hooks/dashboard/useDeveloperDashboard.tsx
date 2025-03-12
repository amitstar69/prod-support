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
  
  const { filters, handleFilterChange, applyFilters } = useTicketFilters();
  const { myApplications, checkIfApplied, fetchMyApplications } = useTicketApplications(userId || '');
  const { 
    isLoading,
    errorMessage,
    fetchTickets: baseFetchTickets,
    recommendTickets
  } = useTicketFetching(isAuthenticated, userId);
  
  const fetchDevelopers = useCallback(async () => {
    if (!isAuthenticated) {
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
  
  const fetchTickets = useCallback(async () => {
    console.log('[DeveloperDashboard] Starting fetchTickets...');
    console.log('[DeveloperDashboard] Auth state:', { isAuthenticated, userId, userType });
    
    if (!isAuthenticated) {
      console.log('[DeveloperDashboard] Using sample data for non-authenticated user');
      const sampleData = generateSampleDeveloperDashboardData();
      setTickets(sampleData.tickets);
      setDevelopers(sampleData.developers);
      setDataSource('local');
      return { success: true, data: sampleData.tickets, source: 'local' };
    }
    
    try {
      console.log('[DeveloperDashboard] Fetching real data for authenticated user');
      const result = await baseFetchTickets(true);
      
      console.log('[DeveloperDashboard] Fetch result:', result);
      
      if (result.success) {
        setTickets(result.data);
        setDataSource(result.source as 'local' | 'database' | 'error');
        
        if (userId) {
          console.log('[DeveloperDashboard] Fetching applications for user:', userId);
          await fetchMyApplications(userId);
        }
        
        await fetchDevelopers();
        
        return result;
      } else {
        console.error('[DeveloperDashboard] Error in fetch result:', result);
        setDataSource('error');
        toast.error(`Error loading tickets: ${result.error}`);
        return result;
      }
    } catch (error) {
      console.error('[DeveloperDashboard] Exception in fetchTickets:', error);
      setDataSource('error');
      toast.error('Failed to load tickets. Please try again.');
      return { success: false, data: tickets, source: 'error', error: String(error) };
    }
  }, [isAuthenticated, userId, baseFetchTickets, fetchMyApplications, fetchDevelopers]);
  
  useEffect(() => {
    console.log('[DeveloperDashboard] Initial load effect triggered');
    fetchTickets().catch(error => {
      console.error('[DeveloperDashboard] Error in initial load:', error);
      toast.error('Failed to initialize dashboard');
    });
  }, [fetchTickets]);
  
  const filteredTickets = Array.isArray(tickets) ? applyFilters(tickets) : [];
  const recommendedTickets = Array.isArray(tickets) ? recommendTickets(tickets, userId) : [];

  const handleClaimTicket = async (ticketId: string) => {
    if (!isAuthenticated) {
      toast.error('You must be logged in to claim tickets');
      return;
    }
    
    if (userType !== 'developer') {
      toast.error('Only developers can claim tickets');
      return;
    }
    
    const hasApplied = checkIfApplied(ticketId);
    if (hasApplied) {
      toast.info('You have already applied to this ticket');
      return;
    }
    
    window.location.href = `/get-help/request/${ticketId}`;
  };
  
  const handleForceRefresh = async () => {
    await fetchTickets();
    toast.success('Data refreshed');
  };
  
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
    
    if (userId) {
      if (isLocalId(userId)) {
        toast.info('You are using a local demo user ID');
      } else {
        toast.info('You have a valid Supabase user ID');
      }
    }
  };
  
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
    debugAuthStatus,
    runDatabaseTest
  };
};
