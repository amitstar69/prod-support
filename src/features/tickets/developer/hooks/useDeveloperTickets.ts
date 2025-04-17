
import { useState, useEffect, useCallback } from 'react';
import { Ticket, TicketFilter, TicketSortOptions } from '../../shared/types/ticket';
// This would be replaced with real API calls
// import { fetchTickets } from '@/integrations/supabase/tickets';

export const useDeveloperTickets = (userId: string) => {
  const [availableTickets, setAvailableTickets] = useState<Ticket[]>([]);
  const [myTickets, setMyTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TicketFilter>({});
  const [sortOptions, setSortOptions] = useState<TicketSortOptions>({
    field: 'updatedAt',
    direction: 'desc'
  });

  const fetchDeveloperTickets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // This would be replaced with real API calls
      // const available = await fetchTickets({ status: ['open'], ...filters }, sortOptions);
      // const mine = await fetchTickets({ developerId: userId, ...filters }, sortOptions);
      
      // For now, we'll simulate responses
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockAvailableTickets: Ticket[] = [
        {
          id: '1',
          title: 'Fix login bug',
          description: 'Users are unable to log in when using Safari',
          clientId: 'client123',
          status: 'open',
          priority: 'high',
          category: 'bug_fix',
          createdAt: new Date(),
          updatedAt: new Date(),
          tags: ['frontend', 'authentication']
        },
        {
          id: '3',
          title: 'Optimize database queries',
          description: 'The app is slow due to inefficient database queries',
          clientId: 'client456',
          status: 'open',
          priority: 'medium',
          category: 'optimization',
          createdAt: new Date(),
          updatedAt: new Date(),
          tags: ['backend', 'database']
        }
      ];
      
      const mockMyTickets: Ticket[] = [
        {
          id: '2',
          title: 'Implement user dashboard',
          description: 'Create a responsive dashboard for users',
          clientId: 'client123',
          developerId: userId,
          status: 'in_progress',
          priority: 'medium',
          category: 'feature_development',
          createdAt: new Date(),
          updatedAt: new Date(),
          tags: ['frontend', 'dashboard']
        }
      ];
      
      setAvailableTickets(mockAvailableTickets);
      setMyTickets(mockMyTickets);
    } catch (err: any) {
      console.error('Failed to fetch developer tickets:', err);
      setError(err.message || 'Failed to fetch tickets');
    } finally {
      setIsLoading(false);
    }
  }, [userId, filters, sortOptions]);

  useEffect(() => {
    if (userId) {
      fetchDeveloperTickets();
    }
  }, [userId, fetchDeveloperTickets]);

  const updateFilters = useCallback((newFilters: Partial<TicketFilter>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const updateSortOptions = useCallback((newOptions: Partial<TicketSortOptions>) => {
    setSortOptions(prev => ({ ...prev, ...newOptions }));
  }, []);

  return {
    availableTickets,
    myTickets,
    isLoading,
    error,
    filters,
    sortOptions,
    updateFilters,
    updateSortOptions,
    refreshTickets: fetchDeveloperTickets
  };
};
