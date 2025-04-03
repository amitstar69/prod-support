
import { useState, useEffect } from 'react';
import { supabase } from '../../integrations/supabase/client';
import { HelpRequest } from '../../types/helpRequest';
import { toast } from 'sonner';

interface UseHelpRequestsTrackingResult {
  helpRequests: HelpRequest[];
  isLoading: boolean;
  error: string | null;
  dataSource: 'database' | 'local' | 'mixed';
  isValidUUID: (uuid: string) => boolean;
  syncLocalToDatabase: () => Promise<void>;
  formatDate: (dateString: string) => string;
  handleViewDetails: (requestId: string) => void;
}

export const useHelpRequestsTracking = (userId: string | null, navigate: any): UseHelpRequestsTrackingResult => {
  const [helpRequests, setHelpRequests] = useState<HelpRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'database' | 'local' | 'mixed'>('database');
  const [loadingTimer, setLoadingTimer] = useState<NodeJS.Timeout | null>(null);

  const isValidUUID = (uuid: string) => {
    if (!uuid) return false;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  };

  const syncLocalToDatabase = async () => {
    if (!userId || !isValidUUID(userId)) return;

    try {
      const localHelpRequests = JSON.parse(localStorage.getItem('helpRequests') || '[]')
        .filter((req: HelpRequest) => req.client_id === userId);
      
      if (localHelpRequests.length === 0) return;

      for (const request of localHelpRequests) {
        if (isValidUUID(request.id)) continue;

        const { id, created_at, updated_at, ...requestData } = request;
        
        const { data, error } = await supabase
          .from('help_requests')
          .insert(requestData)
          .select();
          
        if (error) {
          console.error('Error syncing local request to database:', error);
        } else if (data) {
          console.log('Successfully synced local request to database:', data);
        }
      }

      localStorage.setItem('helpRequests', JSON.stringify(
        JSON.parse(localStorage.getItem('helpRequests') || '[]')
          .filter((req: HelpRequest) => req.client_id !== userId)
      ));
      
      toast.success('Local help requests have been synced to your account');
    } catch (error) {
      console.error('Error during sync process:', error);
      toast.error('Failed to sync local data to database');
    }
  };

  useEffect(() => {
    const fetchHelpRequests = async () => {
      if (!userId) {
        console.error('No user ID found');
        setIsLoading(false);
        setError('User not authenticated. Please log in again.');
        return;
      }

      try {
        console.log('Fetching help requests for user:', userId);
        
        const timer = setTimeout(() => {
          if (isLoading) {
            console.log('Data fetch taking too long, resetting loading state...');
            setIsLoading(false);
            setError('Request timed out. Please refresh the page and try again.');
          }
        }, 15000);
        
        setLoadingTimer(timer);
        
        let localHelpRequests = [];
        try {
          localHelpRequests = JSON.parse(localStorage.getItem('helpRequests') || '[]');
        } catch (e) {
          console.error('Error parsing local help requests:', e);
          localHelpRequests = [];
        }
        
        const userLocalHelpRequests = localHelpRequests.filter((req: HelpRequest) => req.client_id === userId);
        console.log('Local help requests for user:', userLocalHelpRequests);
        
        const isLocalAuth = userId.startsWith('client-');
        const isValidUserUUID = isValidUUID(userId);
        
        if (isLocalAuth) {
          setHelpRequests(userLocalHelpRequests);
          setDataSource('local');
          setIsLoading(false);
          return;
        }
        
        if (isValidUserUUID) {
          try {
            const { data: sessionData } = await supabase.auth.getSession();
            
            if (sessionData && sessionData.session) {
              const { data, error: supabaseError } = await supabase
                .from('help_requests')
                .select('*')
                .eq('client_id', userId);

              if (supabaseError) {
                console.error('Error fetching help requests from Supabase:', supabaseError);
                
                if (userLocalHelpRequests.length > 0) {
                  setHelpRequests(userLocalHelpRequests);
                  setDataSource('local');
                  setError('Failed to load help requests from database. Showing local requests only.');
                } else {
                  setHelpRequests([]);
                  setError('Failed to load help requests from database.');
                }
              } else {
                console.log('Help requests data from Supabase:', data);
                
                if (userLocalHelpRequests.length > 0) {
                  setDataSource('mixed');
                  await syncLocalToDatabase();
                  
                  const { data: refreshedData } = await supabase
                    .from('help_requests')
                    .select('*')
                    .eq('client_id', userId);
                    
                  if (refreshedData && refreshedData.length > 0) {
                    setHelpRequests(refreshedData);
                  } else {
                    setHelpRequests(data || []);
                  }
                } else {
                  setHelpRequests(data || []);
                  setDataSource('database');
                }
              }
            } else {
              setHelpRequests(userLocalHelpRequests);
              setDataSource('local');
              setError('No active session. Please log in again.');
            }
          } catch (supabaseError) {
            console.error('Exception fetching from Supabase:', supabaseError);
            setHelpRequests(userLocalHelpRequests);
            setDataSource('local');
            setError('Failed to connect to database, showing local requests only');
          }
        } else {
          setHelpRequests(userLocalHelpRequests);
          setDataSource('local');
          setError('Invalid user ID format. Using local data only.');
        }
      } catch (error) {
        console.error('Exception fetching help requests:', error);
        setError('An unexpected error occurred');
        setHelpRequests([]);
      } finally {
        if (loadingTimer) {
          clearTimeout(loadingTimer);
          setLoadingTimer(null);
        }
        setIsLoading(false);
      }
    };

    fetchHelpRequests();
    
    return () => {
      if (loadingTimer) {
        clearTimeout(loadingTimer);
      }
    };
  }, [userId]);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      console.error('Error formatting date:', e);
      return 'Invalid date';
    }
  };

  const handleViewDetails = (requestId: string) => {
    navigate(`/get-help/request/${requestId}`);
  };

  return {
    helpRequests,
    isLoading,
    error,
    dataSource,
    isValidUUID,
    syncLocalToDatabase,
    formatDate,
    handleViewDetails,
  };
};
