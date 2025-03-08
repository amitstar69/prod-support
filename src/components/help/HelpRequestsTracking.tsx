
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../integrations/supabase/client';
import { useAuth } from '../../contexts/auth';
import { HelpRequest } from '../../types/helpRequest';
import { toast } from 'sonner';
import { Loader2, ExternalLink, Clock, AlertCircle, CheckCircle2, Calendar, FileEdit, Play, PauseCircle, UserCheck2, Check } from 'lucide-react';

const statusColors = {
  'requirements': 'bg-purple-100 text-purple-800',
  'todo': 'bg-blue-100 text-blue-800',
  'in-progress-unpaid': 'bg-yellow-100 text-yellow-800',
  'in-progress-paid': 'bg-green-100 text-green-800',
  'client-review': 'bg-orange-100 text-orange-800',
  'production': 'bg-pink-100 text-pink-800',
  'completed': 'bg-gray-100 text-gray-800',
  'cancelled': 'bg-red-100 text-red-800',
  'pending': 'bg-yellow-100 text-yellow-800',
  'matching': 'bg-blue-100 text-blue-800',
  'scheduled': 'bg-purple-100 text-purple-800',
  'in-progress': 'bg-green-100 text-green-800'
};

const statusIcons = {
  'requirements': <FileEdit className="h-4 w-4" />,
  'todo': <Clock className="h-4 w-4" />,
  'in-progress-unpaid': <Play className="h-4 w-4" />,
  'in-progress-paid': <Play className="h-4 w-4 text-green-600" />,
  'client-review': <UserCheck2 className="h-4 w-4" />,
  'production': <PauseCircle className="h-4 w-4" />,
  'completed': <Check className="h-4 w-4" />,
  'cancelled': <AlertCircle className="h-4 w-4" />,
  'pending': <Clock className="h-4 w-4" />,
  'matching': <Loader2 className="h-4 w-4" />,
  'scheduled': <Calendar className="h-4 w-4" />,
  'in-progress': <Loader2 className="h-4 w-4 animate-spin" />
};

const statusLabels = {
  'requirements': 'Requirements',
  'todo': 'To Do',
  'in-progress-unpaid': 'In Progress (Unpaid)',
  'in-progress-paid': 'In Progress (Paid)',
  'client-review': 'Client Review',
  'production': 'In Production',
  'completed': 'Completed',
  'cancelled': 'Cancelled',
  'pending': 'Pending',
  'matching': 'Matching',
  'scheduled': 'Scheduled',
  'in-progress': 'In Progress'
};

const HelpRequestsTracking: React.FC = () => {
  const { userId } = useAuth();
  const navigate = useNavigate();
  const [helpRequests, setHelpRequests] = useState<HelpRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'database' | 'local' | 'mixed'>('database');

  const isValidUUID = (uuid: string) => {
    if (!uuid) return false;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  };

  // Function to sync data from localStorage to Supabase
  const syncLocalToDatabase = async () => {
    if (!userId || !isValidUUID(userId)) return;

    try {
      // Get local requests for this user
      const localHelpRequests = JSON.parse(localStorage.getItem('helpRequests') || '[]')
        .filter((req: HelpRequest) => req.client_id === userId);
      
      if (localHelpRequests.length === 0) return;

      // For each local request, transfer to Supabase if it doesn't exist there
      for (const request of localHelpRequests) {
        // Skip any that have a database-style ID (already synced)
        if (isValidUUID(request.id)) continue;

        // Create a new request in Supabase without the local ID
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

      // Clear local storage after successful sync
      localStorage.setItem('helpRequests', JSON.stringify(
        JSON.parse(localStorage.getItem('helpRequests') || '[]')
          .filter((req: HelpRequest) => req.client_id !== userId)
      ));
      
      toast.success('Local help requests have been synced to your account');
    } catch (error) {
      console.error('Error during sync process:', error);
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
        
        // Get local help requests first
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
        
        // If using local auth, just use local storage
        if (isLocalAuth) {
          setHelpRequests(userLocalHelpRequests);
          setDataSource('local');
          setIsLoading(false);
          return;
        }
        
        // For database users, prioritize database records
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
                
                // If we have local requests for this authenticated user, offer to sync
                if (userLocalHelpRequests.length > 0) {
                  setDataSource('mixed');
                  // Sync local data to database if user has a valid session
                  await syncLocalToDatabase();
                  
                  // Refresh from database after sync
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
              // No active session but valid UUID - use local data
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
          // Invalid UUID format - use local data
          setHelpRequests(userLocalHelpRequests);
          setDataSource('local');
          setError('Invalid user ID format. Using local data only.');
        }
      } catch (error) {
        console.error('Exception fetching help requests:', error);
        setError('An unexpected error occurred');
        setHelpRequests([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHelpRequests();
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Your Help Requests</h2>
        <button
          onClick={() => navigate('/get-help')}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
        >
          Create New Request
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg mb-6">
          <p className="font-medium">{error}</p>
        </div>
      )}

      {dataSource === 'local' && isValidUUID(userId) && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg mb-6">
          <p className="font-medium">You have local help requests that can be synchronized with your account.</p>
          <button 
            onClick={syncLocalToDatabase}
            className="mt-2 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            Sync to Database
          </button>
        </div>
      )}

      {helpRequests.length === 0 ? (
        <div className="bg-white p-8 rounded-xl border border-border/40 text-center">
          <h3 className="text-lg font-medium mb-2">No help requests yet</h3>
          <p className="text-muted-foreground mb-4">
            You haven't submitted any help requests. Create one to get assistance from our developers.
          </p>
          <button
            onClick={() => navigate('/get-help')}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            Create Your First Request
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {helpRequests.map((request) => (
            <div
              key={request.id || `temp-${Math.random()}`}
              className="bg-white p-6 rounded-xl border border-border/40 hover:border-primary/40 transition-colors cursor-pointer"
              onClick={() => request.id && handleViewDetails(request.id)}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-medium">{request.title || 'Untitled Request'}</h3>
                <div className={`px-3 py-1 rounded-full text-xs flex items-center gap-1 ${statusColors[request.status || 'pending']}`}>
                  {statusIcons[request.status || 'pending']}
                  <span>{statusLabels[request.status || 'pending']}</span>
                </div>
              </div>
              
              <p className="text-muted-foreground line-clamp-2 mb-3">{request.description || 'No description'}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-3">
                <div>
                  <span className="text-muted-foreground">Technical Area:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {request.technical_area && Array.isArray(request.technical_area) && request.technical_area.length > 0 ? (
                      <>
                        {request.technical_area.slice(0, 2).map((area, i) => (
                          <span key={i} className="bg-secondary/50 px-2 py-0.5 rounded text-xs">
                            {area}
                          </span>
                        ))}
                        {request.technical_area.length > 2 && (
                          <span className="bg-secondary/50 px-2 py-0.5 rounded text-xs">
                            +{request.technical_area.length - 2}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground">Not specified</span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Budget:</span>
                  <p>{request.budget_range || 'Not specified'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Created:</span>
                  <p>{request.created_at ? formatDate(request.created_at) : 'N/A'}</p>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    request.id && handleViewDetails(request.id);
                  }}
                  className="text-primary flex items-center gap-1 text-sm hover:underline"
                >
                  View Details <ExternalLink className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HelpRequestsTracking;
