
import { useState, useEffect, useCallback } from 'react';
import { Ticket, TicketFilter, TicketSortOptions } from '../../shared/types/ticket';
// This would be replaced with real API calls
// import { fetchTickets } from '@/integrations/supabase/tickets';

export const useClientTickets = (userId: string) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TicketFilter>({});
  const [sortOptions, setSortOptions] = useState<TicketSortOptions>({
    field: 'updatedAt',
    direction: 'desc'
  });

  const fetchClientTickets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // This would be replaced with real API calls
      // const result = await fetchTickets({ clientId: userId, ...filters }, sortOptions);
      // For now, we'll simulate a response
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockTickets: Ticket[] = [
        {
          id: '1',
          title: 'Fix login bug',
          description: 'Users are unable to log in when using Safari',
          clientId: userId,
          status: 'open',
          priority: 'high',
          category: 'bug_fix',
          createdAt: new Date(),
          updatedAt: new Date(),
          tags: ['frontend', 'authentication']
        },
        {
          id: '2',
          title: 'Implement user dashboard',
          description: 'Create a responsive dashboard for users',
          clientId: userId,
          status: 'draft',
          priority: 'medium',
          category: 'feature_development',
          createdAt: new Date(),
          updatedAt: new Date(),
          tags: ['frontend', 'dashboard']
        }
      ];
      
      setTickets(mockTickets);
    } catch (err: any) {
      console.error('Failed to fetch client tickets:', err);
      setError(err.message || 'Failed to fetch tickets');
    } finally {
      setIsLoading(false);
    }
  }, [userId, filters, sortOptions]);

  useEffect(() => {
    if (userId) {
      fetchClientTickets();
    }
  }, [userId, fetchClientTickets]);

  const updateFilters = useCallback((newFilters: Partial<TicketFilter>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const updateSortOptions = useCallback((newOptions: Partial<TicketSortOptions>) => {
    setSortOptions(prev => ({ ...prev, ...newOptions }));
  }, []);

  return {
    tickets,
    isLoading,
    error,
    filters,
    sortOptions,
    updateFilters,
    updateSortOptions,
    refreshTickets: fetchClientTickets
  };
};
