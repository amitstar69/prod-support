import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../contexts/auth';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { updateApplicationStatus } from '../integrations/supabase/helpRequestsApplications';
import { HelpRequestMatch, HelpRequest, DeveloperProfile } from '../types/helpRequest';
import { toast } from 'sonner';
import { MATCH_STATUSES } from '../utils/constants/statusConstants';
import { isDeveloperProfile, safelyGetProperty } from '../utils/typeGuards';

const ApplicationDetailPage = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();
  const { userId } = useAuth();
  const [application, setApplication] = useState<HelpRequestMatch | null>(null);
  const [ticket, setTicket] = useState<HelpRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [processingAction, setProcessingAction] = useState<string | null>(null);

  useEffect(() => {
    if (!applicationId || !userId) return;

    const fetchApplicationDetails = async () => {
      setIsLoading(true);
      try {
        // Fetch application with developer profile
        const { data: applicationData, error: applicationError } = await supabase
          .from('help_request_matches')
          .select(`
            *,
            profiles:developer_id (*),
            developer_profiles:developer_id (*)
          `)
          .eq('id', applicationId)
          .single();

        if (applicationError) {
          console.error('Error fetching application:', applicationError);
          toast.error('Failed to load application details');
          return;
        }

        // Process application data with safe access to developer_profiles
        const developerProfiles = applicationData.developer_profiles || {};
        
        // Safely access properties with fallbacks using our utility functions
        const dp = applicationData.developer_profiles as DeveloperProfile | null;
        const skills = Array.isArray(dp?.skills) ? dp.skills : [];
        const experience = typeof dp?.experience === 'string' ? dp.experience : '';
        const hourly_rate = typeof dp?.hourly_rate === 'number' ? dp.hourly_rate : 0;
        
        // Create a properly typed application object
        const processedApplication: HelpRequestMatch = {
          ...applicationData,
          developer_profiles: {
            id: applicationData.developer_id,
            skills,
            experience,
            hourly_rate
          }
        };
        
        setApplication(processedApplication);

        // Fetch the ticket details
        const { data: ticketData, error: ticketError } = await supabase
          .from('help_requests')
          .select('*')
          .eq('id', applicationData.request_id)
          .single();

        if (ticketError) {
          console.error('Error fetching ticket:', ticketError);
          toast.error('Failed to load ticket details');
        } else {
          // Fix for the setTicket payload issue
          setTicket(ticketData as HelpRequest);
        }
      } catch (error) {
        console.error('Failed to fetch application details:', error);
        toast.error('An error occurred while loading application details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplicationDetails();
  }, [applicationId, userId]);

  const handleAccept = async () => {
    if (!application || !userId) return;

    setProcessingAction('accepting');
    
    const result = await updateApplicationStatus(
      application.id!,
      'approved',
      userId
    );

    setProcessingAction(null);

    if (result.success) {
      toast.success('Application accepted successfully!');
      
      // Navigate to ticket detail
      if (application.request_id) {
        navigate(`/client/tickets/${application.request_id}`);
      } else {
        navigate('/client/tickets');
      }
    } else {
      toast.error(`Failed to accept application: ${result.error}`);
    }
  };

  const handleReject = async () => {
    if (!application || !userId) return;

    setProcessingAction('rejecting');
    
    const result = await updateApplicationStatus(
      application.id!,
      'rejected',
      userId
    );

    setProcessingAction(null);

    if (result.success) {
      toast.success('Application rejected successfully');
      
      if (application.request_id) {
        navigate(`/client/tickets/${application.request_id}`);
      } else {
        navigate('/client/tickets');
      }
    } else {
      toast.error(`Failed to reject application: ${result.error}`);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container max-w-3xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-muted rounded w-3/4"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!application) {
    return (
      <Layout>
        <div className="container max-w-3xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-semibold mb-4">Application Not Found</h1>
          <p>Sorry, the application you are looking for does not exist or you do not have permission to view it.</p>
          <Button onClick={() => navigate('/client/tickets')} className="mt-4">
            Back to Tickets
          </Button>
        </div>
      </Layout>
    );
  }

  const getStatusBadge = (status: string | undefined) => {
    if (!status) return <Badge>Unknown</Badge>;

    if (status === MATCH_STATUSES.PENDING) {
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">Pending</Badge>;
    } else if (status === MATCH_STATUSES.APPROVED_BY_CLIENT) {
      return <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">Approved</Badge>;
    } else if (status === MATCH_STATUSES.REJECTED_BY_CLIENT) {
      return <Badge variant="outline" className="bg-red-50 text-red-800 border-red-200">Rejected</Badge>;
    }
    
    return <Badge>{status}</Badge>;
  };

  const isApplicationPending = application.status === MATCH_STATUSES.PENDING;

  return (
    <Layout>
      <div className="container max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="outline" className="mb-4" onClick={() => navigate(-1)}>
            Back
          </Button>
          
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h1 className="text-2xl font-semibold">Developer Application</h1>
            {getStatusBadge(application.status)}
          </div>
          
          {ticket && (
            <div className="mt-2 text-sm text-muted-foreground">
              For help request: {ticket.title}
            </div>
          )}
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Developer Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 mb-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={application.profiles?.image || ''} alt={application.profiles?.name || 'Developer'} />
                <AvatarFallback>{(application.profiles?.name?.[0] || 'D').toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">{application.profiles?.name || 'Anonymous Developer'}</h3>
                <p className="text-sm text-muted-foreground">{application.developer_profiles?.experience || ''}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {application.developer_profiles?.skills && application.developer_profiles.skills.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-1">Skills</h4>
                  <div className="flex flex-wrap gap-1">
                    {application.developer_profiles.skills.map((skill, index) => (
                      <Badge variant="outline" key={index}>{skill}</Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <h4 className="text-sm font-semibold mb-1">Hourly Rate</h4>
                <p>${application.proposed_rate || application.developer_profiles?.hourly_rate || 0}/hr</p>
              </div>
              
              {application.proposed_duration && (
                <div>
                  <h4 className="text-sm font-semibold mb-1">Estimated Duration</h4>
                  <p>{application.proposed_duration} hours</p>
                </div>
              )}
              
              {application.proposed_message && (
                <div>
                  <h4 className="text-sm font-semibold mb-1">Message from Developer</h4>
                  <div className="bg-muted/30 p-3 rounded-md">
                    {application.proposed_message}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {ticket && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Help Request Details</CardTitle>
            </CardHeader>
            <CardContent>
              <h3 className="text-lg font-semibold">{ticket.title}</h3>
              <p className="mt-2">{ticket.description}</p>
              
              <div className="mt-4 space-y-2">
                {ticket.technical_area && ticket.technical_area.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold">Technical Areas</h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {ticket.technical_area.map((area, index) => (
                        <Badge key={index} variant="outline">{area}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-semibold">Urgency</h4>
                    <p>{ticket.urgency}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Budget Range</h4>
                    <p>{ticket.budget_range}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {isApplicationPending && (
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              variant="destructive" 
              className="flex-1"
              onClick={handleReject}
              disabled={processingAction !== null}
            >
              {processingAction === 'rejecting' ? 'Rejecting...' : 'Reject Application'}
            </Button>
            <Button 
              variant="default" 
              className="flex-1"
              onClick={handleAccept}
              disabled={processingAction !== null}
            >
              {processingAction === 'accepting' ? 'Accepting...' : 'Accept Application'}
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ApplicationDetailPage;
