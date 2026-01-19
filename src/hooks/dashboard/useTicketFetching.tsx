 import { useCallback } from 'react';                                                                                                                                               
  import { useState, useEffect } from 'react';                                                                                                                                       
  import { supabase } from '../../integrations/supabase/client';                                                                                                                     
  import { HelpRequest } from '../../types/helpRequest';                                                                                                                             
  import { HELP_REQUEST_STATUSES } from '../../utils/constants/statusConstants';                                                                                                     
                                                                                                                                                                                     
  interface UseTicketFetchingResult {                                                                                                                                                
    tickets: HelpRequest[];                                                                                                                                                          
    isLoading: boolean;                                                                                                                                                              
    error: string | null;                                                                                                                                                            
    fetchTickets: (showLoading?: boolean) => Promise<void>;                                                                                                                          
    category: string;                                                                                                                                                                
    hasError?: boolean;                                                                                                                                                              
    dataSource?: string;                                                                                                                                                             
    handleForceRefresh?: () => Promise<void>;                                                                                                                                        
  }                                                                                                                                                                                  
                                                                                                                                                                                     
  const determineTicketCategory = (status: string) => {                                                                                                                              
    // Map old statuses to new ones for compatibility                                                                                                                                
    const statusMapping = {                                                                                                                                                          
      'submitted': HELP_REQUEST_STATUSES.OPEN,                                                                                                                                       
      'dev_requested': HELP_REQUEST_STATUSES.PENDING_MATCH,                                                                                                                          
      'pending_developer_approval': HELP_REQUEST_STATUSES.AWAITING_CLIENT_APPROVAL                                                                                                   
    };                                                                                                                                                                               
                                                                                                                                                                                     
    const normalizedStatus = statusMapping[status] || status;                                                                                                                        
                                                                                                                                                                                     
    if ([                                                                                                                                                                            
      HELP_REQUEST_STATUSES.OPEN,                                                                                                                                                    
      HELP_REQUEST_STATUSES.PENDING_MATCH,                                                                                                                                           
      HELP_REQUEST_STATUSES.AWAITING_CLIENT_APPROVAL                                                                                                                                 
    ].includes(normalizedStatus)) {                                                                                                                                                  
      return 'open';                                                                                                                                                                 
    }                                                                                                                                                                                
                                                                                                                                                                                     
    if ([                                                                                                                                                                            
      HELP_REQUEST_STATUSES.IN_PROGRESS,                                                                                                                                             
      HELP_REQUEST_STATUSES.AWAITING_CLIENT_APPROVAL,                                                                                                                                
      HELP_REQUEST_STATUSES.REQUIREMENTS_REVIEW,                                                                                                                                     
      HELP_REQUEST_STATUSES.NEED_MORE_INFO,                                                                                                                                          
      HELP_REQUEST_STATUSES.READY_FOR_QA,                                                                                                                                            
      HELP_REQUEST_STATUSES.READY_FOR_CLIENT_QA,                                                                                                                                     
      HELP_REQUEST_STATUSES.QA_FAIL,                                                                                                                                                 
      HELP_REQUEST_STATUSES.QA_PASS,                                                                                                                                                 
      HELP_REQUEST_STATUSES.READY_FOR_FINAL_ACTION                                                                                                                                   
    ].includes(normalizedStatus)) {                                                                                                                                                  
      return 'inProgress';                                                                                                                                                           
    }                                                                                                                                                                                
                                                                                                                                                                                     
    if ([                                                                                                                                                                            
      HELP_REQUEST_STATUSES.COMPLETED,                                                                                                                                               
      HELP_REQUEST_STATUSES.RESOLVED                                                                                                                                                 
    ].includes(normalizedStatus)) {                                                                                                                                                  
      return 'completed';                                                                                                                                                            
    }                                                                                                                                                                                
                                                                                                                                                                                     
    return 'other';                                                                                                                                                                  
  };                                                                                                                                                                                 
                                                                                                                                                                                     
  // Helper function to normalize attachments to always be an array                                                                                                                  
  const normalizeAttachments = (attachments: any): any[] => {                                                                                                                        
    if (!attachments) {                                                                                                                                                              
      return [];                                                                                                                                                                     
    }                                                                                                                                                                                
                                                                                                                                                                                     
    if (Array.isArray(attachments)) {                                                                                                                                                
      return attachments;                                                                                                                                                            
    }                                                                                                                                                                                
                                                                                                                                                                                     
    if (typeof attachments === 'string') {                                                                                                                                           
      try {                                                                                                                                                                          
        const parsed = JSON.parse(attachments);                                                                                                                                      
        return Array.isArray(parsed) ? parsed : [];                                                                                                                                  
      } catch (e) {                                                                                                                                                                  
        return [];                                                                                                                                                                   
      }                                                                                                                                                                              
    }                                                                                                                                                                                
                                                                                                                                                                                     
    return [];                                                                                                                                                                       
  };                                                                                                                                                                                 
                                                                                                                                                                                     
  // Updated to make the parameter optional with a default value                                                                                                                     
  export const useTicketFetching = (initialCategory?: string): UseTicketFetchingResult => {                                                                                          
    const category = initialCategory ?? 'all';                                                                                                                                       
    const [tickets, setTickets] = useState<HelpRequest[]>([]);                                                                                                                       
    const [isLoading, setIsLoading] = useState(true);                                                                                                                                
    const [error, setError] = useState<string | null>(null);                                                                                                                         
    const [dataSource, setDataSource] = useState<string>('cache');                                                                                                                   
    const [hasError, setHasError] = useState<boolean>(false);                                                                                                                        
                                                                                                                                                                                     
    const fetchTickets = useCallback(async (showLoading: boolean = true) => {                                                                                                        
      console.log('[useTicketFetching] fetchTickets called', { showLoading, category });                                                                                             
                                                                                                                                                                                     
      if (showLoading) {                                                                                                                                                             
        setIsLoading(true);                                                                                                                                                          
      }                                                                                                                                                                              
      setError(null);                                                                                                                                                                
      setHasError(false);                                                                                                                                                            
                                                                                                                                                                                     
      try {                                                                                                                                                                          
        console.log('[useTicketFetching] Querying help_requests from Supabase...');                                                                                                  
        let query = supabase                                                                                                                                                         
          .from('help_requests')                                                                                                                                                     
          .select('*')                                                                                                                                                               
          .order('created_at', { ascending: false });                                                                                                                                
                                                                                                                                                                                     
        if (category && category !== 'all') {                                                                                                                                        
          console.log(`Fetching tickets for category: ${category}`);                                                                                                                 
        }                                                                                                                                                                            
                                                                                                                                                                                     
        const { data, error } = await query;                                                                                                                                         
                                                                                                                                                                                     
        console.log('[useTicketFetching] Supabase response:', {                                                                                                                      
          dataCount: data?.length,                                                                                                                                                   
          error: error?.message                                                                                                                                                      
        });                                                                                                                                                                          
                                                                                                                                                                                     
        if (error) {                                                                                                                                                                 
          throw new Error(error.message);                                                                                                                                            
        }                                                                                                                                                                            
                                                                                                                                                                                     
        // Add proper type conversion for the attachments field                                                                                                                      
        const processedTickets = data?.map(ticket => {                                                                                                                               
          return {                                                                                                                                                                   
            ...ticket,                                                                                                                                                               
            attachments: normalizeAttachments(ticket.attachments)                                                                                                                    
          } as HelpRequest;                                                                                                                                                          
        }) || [];                                                                                                                                                                    
                                                                                                                                                                                     
        console.log('[useTicketFetching] Processed tickets:', processedTickets.length);                                                                                              
        setTickets(processedTickets);                                                                                                                                                
        setDataSource('api');                                                                                                                                                        
      } catch (err) {                                                                                                                                                                
        console.error('[useTicketFetching] Error fetching tickets:', err);                                                                                                           
        setError(err instanceof Error ? err.message : 'Failed to load tickets');                                                                                                     
        setHasError(true);                                                                                                                                                           
      } finally {                                                                                                                                                                    
        if (showLoading) {                                                                                                                                                           
          setIsLoading(false);                                                                                                                                                       
        }                                                                                                                                                                            
      }                                                                                                                                                                              
    }, [category]);                                                                                                                                                                  
                                                                                                                                                                                     
    // Add a force refresh method that doesn't show loading state                                                                                                                    
    const handleForceRefresh = useCallback(async () => {                                                                                                                             
      console.log('[useTicketFetching] Force refresh triggered');                                                                                                                    
      await fetchTickets(false);                                                                                                                                                     
    }, [fetchTickets]);                                                                                                                                                              
                                                                                                                                                                                     
    useEffect(() => {                                                                                                                                                                
      console.log('[useTicketFetching] Auto-fetching tickets on mount/category change', { category });                                                                               
      fetchTickets();                                                                                                                                                                
    }, [category, fetchTickets]);                                                                                                                                                    
                                                                                                                                                                                     
    return {                                                                                                                                                                         
      tickets,                                                                                                                                                                       
      isLoading,                                                                                                                                                                     
      error,                                                                                                                                                                         
      fetchTickets,                                                                                                                                                                  
      category,                                                                                                                                                                      
      hasError,                                                                                                                                                                      
      dataSource,                                                                                                                                                                    
      handleForceRefresh                                                                                                                                                             
    };                                                                                                                                                                               
  };                   
