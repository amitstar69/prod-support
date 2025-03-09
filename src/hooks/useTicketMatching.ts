
import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { HelpRequest } from '../types/helpRequest';
import { Developer } from '../types/product';
import { TicketWithMatches } from '../types/matching';
import { processBatchMatching, findBestDeveloperMatches } from '../utils/matchingAlgorithm';
import { toast } from 'sonner';

interface UseTicketMatchingResult {
  isLoading: boolean;
  error: string | null;
  ticketsWithMatches: TicketWithMatches[];
  matchTicketWithDevelopers: (ticket: HelpRequest, developers: Developer[]) => TicketWithMatches;
  refreshMatching: () => Promise<void>;
}

export const useTicketMatching = (
  tickets?: HelpRequest[],
  developers?: Developer[]
): UseTicketMatchingResult => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [ticketsWithMatches, setTicketsWithMatches] = useState<TicketWithMatches[]>([]);
  const [localTickets, setLocalTickets] = useState<HelpRequest[]>(tickets || []);
  const [localDevelopers, setLocalDevelopers] = useState<Developer[]>(developers || []);
  
  // Function to fetch developers if not provided
  const fetchDevelopers = async (): Promise<Developer[]> => {
    try {
      if (developers && developers.length > 0) {
        return developers;
      }
      
      // Fetch developers from Supabase
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
        throw new Error(`Error fetching developers: ${error.message}`);
      }
      
      // Transform the data to match the Developer interface
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
      
      return formattedDevelopers;
    } catch (err) {
      console.error("Error fetching developers:", err);
      setError(err instanceof Error ? err.message : 'Unknown error fetching developers');
      
      // Return empty array in case of error
      return [];
    }
  };
  
  // Function to fetch tickets if not provided
  const fetchTickets = async (): Promise<HelpRequest[]> => {
    try {
      if (tickets && tickets.length > 0) {
        return tickets;
      }
      
      // Fetch open tickets from Supabase
      const { data, error } = await supabase
        .from('help_requests')
        .select('*')
        .in('status', ['pending', 'matching'])
        .order('created_at', { ascending: false });
        
      if (error) {
        throw new Error(`Error fetching tickets: ${error.message}`);
      }
      
      return data;
    } catch (err) {
      console.error("Error fetching tickets:", err);
      setError(err instanceof Error ? err.message : 'Unknown error fetching tickets');
      
      // Return empty array in case of error
      return [];
    }
  };
  
  // Function to run matching algorithm on a single ticket
  const matchTicketWithDevelopers = (ticket: HelpRequest, devs: Developer[]): TicketWithMatches => {
    return findBestDeveloperMatches(ticket, devs);
  };
  
  // Function to refresh matching results
  const refreshMatching = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const fetchedDevelopers = await fetchDevelopers();
      const fetchedTickets = await fetchTickets();
      
      setLocalDevelopers(fetchedDevelopers);
      setLocalTickets(fetchedTickets);
      
      if (fetchedTickets.length === 0) {
        setTicketsWithMatches([]);
        setIsLoading(false);
        return;
      }
      
      if (fetchedDevelopers.length === 0) {
        setError('No developers available for matching');
        setTicketsWithMatches([]);
        setIsLoading(false);
        return;
      }
      
      // Run batch matching algorithm
      const results = processBatchMatching(fetchedTickets, fetchedDevelopers);
      setTicketsWithMatches(results);
      
      // Notify about high priority matches with excellent fit
      results.forEach(result => {
        if (
          (result.priorityLevel === 'critical' || result.priorityLevel === 'high') &&
          result.matches.length > 0 &&
          result.matches[0].matchScore >= 80
        ) {
          toast.info(
            `High priority ticket '${result.ticket.title}' has an excellent developer match!`,
            {
              duration: 6000,
              action: {
                label: 'View',
                onClick: () => {
                  // This would ideally navigate to the ticket detail page
                  console.log('Navigating to ticket', result.ticket.id);
                }
              }
            }
          );
        }
      });
    } catch (err) {
      console.error("Error during matching refresh:", err);
      setError(err instanceof Error ? err.message : 'Unknown error during matching');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Run matching on initial load and when dependencies change
  useEffect(() => {
    refreshMatching();
  }, [JSON.stringify(tickets), JSON.stringify(developers)]);
  
  return {
    isLoading,
    error,
    ticketsWithMatches,
    matchTicketWithDevelopers,
    refreshMatching
  };
};
