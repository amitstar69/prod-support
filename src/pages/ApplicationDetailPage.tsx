import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { HelpRequestMatch } from '../types/helpRequest';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import { Loader2 } from 'lucide-react';
import { MATCH_STATUSES } from '../utils/constants/statusConstants';
import { updateApplicationStatus } from '../integrations/supabase/helpRequestsApplications';

const ApplicationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [application, setApplication] = useState<HelpRequestMatch | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchApplication = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase
          .from('help_request_matches')
          .select(`
            *,
            profiles:developer_id (id, name, image, description, location),
            developer_profiles:developer_id (id, skills, experience, hourly_rate)
          `)
          .eq('id', id)
          .single();
        
        if (error) {
          console.error('Error fetching application:', error);
          setError('Failed to load application details.');
          return;
        }
        
        if (!data) {
          setError('Application not found.');
          return;
        }
        
        // Ensure we have valid profiles data
        let safeProfiles = data.profiles;
        
        if (!safeProfiles || typeof safeProfiles !== 'object') {
          safeProfiles = { 
            id: data.developer_id, 
            name: 'Unknown Developer',
            image: null,
            description: '',
            location: ''
          };
        } else if (!safeProfiles.description) {
          safeProfiles.description = '';
        } else if (!safeProfiles.location) {
          safeProfiles.location = '';
        }
        
        // Ensure we have valid developer_profiles data
        let safeDeveloperProfiles = data.developer_profiles;
        
        if (!safeDeveloperProfiles || typeof safeDeveloperProfiles !== 'object') {
          safeDeveloperProfiles = {
            id: data.developer_id,
            skills: [],
            experience: '',
            hourly_rate: 0
          };
        }
        
        const typedApplication: HelpRequestMatch = {
          ...data,
          profiles: safeProfiles,
          developer_profiles: safeDeveloperProfiles
        } as HelpRequestMatch;
        
        setApplication(typedApplication);
      } catch (err) {
        console.error('Error in fetchApplication:', err);
        setError('An unexpected error occurred.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchApplication();
  }, [id]);
  
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    
    fetchUser();
  }, []);

  const handleApproveApplication = async () => {
    if (!application?.id) return;
    
    setActionInProgress('approve');
    
    try {
      const result = await updateApplicationStatus(
        application.id,
        'approved',
        user?.id || ''
      );
      
      if (!result.success) {
        toast.error(`Failed to approve application: ${result.error}`);
        return;
      }
      
      toast.success('Application approved successfully!');
      
      // Update local state
      setApplication({
        ...application,
        status: MATCH_STATUSES.APPROVED_BY_CLIENT
      });
      
      // Navigate back to ticket detail
      navigate(`/client/tickets/${application.request_id}`);
      
    } catch (err) {
      console.error('Error approving application:', err);
      toast.error('An unexpected error occurred');
    } finally {
      setActionInProgress('');
    }
  };
  
  const handleRejectApplication = async () => {
    if (!application?.id) return;
    
    setActionInProgress('reject');
    
    try {
      const result = await updateApplicationStatus(
        application.id,
        'rejected',
        user?.id || ''
      );
      
      if (!result.success) {
        toast.error(`Failed to reject application: ${result.error}`);
        return;
      }
      
      toast.success('Application rejected successfully');
      
      // Update local state
      setApplication({
        ...application,
        status: MATCH_STATUSES.REJECTED_BY_CLIENT
      });
      
      // Navigate back to ticket listing
      navigate('/client/tickets');
      
    } catch (err) {
      console.error('Error rejecting application:', err);
      toast.error('An unexpected error occurred');
    } finally {
      setActionInProgress('');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500">Error: {error}</div>
    );
  }

  if (!application) {
    return (
      <div className="text-gray-500">Application not found.</div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Developer Application Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-4">
            <Avatar>
              <AvatarImage src={application.profiles?.image || ''} alt={application.profiles?.name || 'Developer'} />
              <AvatarFallback>{application.profiles ? (application.profiles.name || 'Dev').substring(0, 2) : 'Dev'}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-semibold">{application.profiles?.name || 'Anonymous Developer'}</h2>
              <p className="text-sm text-muted-foreground">{application.profiles?.location || 'Location Unavailable'}</p>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="text-md font-semibold">Proposed Message</h3>
            <p>{application.proposed_message || 'No message provided.'}</p>
          </div>

          <div className="mb-4">
            <h3 className="text-md font-semibold">Skills</h3>
            <p>{application.developer_profiles?.skills?.join(', ') || 'No skills listed.'}</p>
          </div>

          <div className="mb-4">
            <h3 className="text-md font-semibold">Experience</h3>
            <p>{application.developer_profiles?.experience || 'No experience listed.'}</p>
          </div>

          <div className="mb-4">
            <h3 className="text-md font-semibold">Hourly Rate</h3>
            <p>${application.developer_profiles?.hourly_rate || 'Not specified'}</p>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              variant="destructive"
              onClick={handleRejectApplication}
              disabled={actionInProgress === 'reject'}
            >
              {actionInProgress === 'reject' ? (
                <>
                  Rejecting <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                </>
              ) : (
                'Reject Application'
              )}
            </Button>
            <Button
              onClick={handleApproveApplication}
              disabled={actionInProgress === 'approve'}
            >
              {actionInProgress === 'approve' ? (
                <>
                  Approving <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                </>
              ) : (
                'Approve Application'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApplicationDetailPage;
