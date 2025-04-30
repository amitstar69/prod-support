import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { ChevronLeft, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { HelpRequestMatch, DeveloperProfile } from '../types/helpRequest';

const ApplicationDetailPage = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();
  const [application, setApplication] = useState<HelpRequestMatch | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplication = async () => {
      if (!applicationId) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('help_request_matches')
          .select(`
            *,
            profiles(*),
            developer_profiles(*),
            help_requests(*)
          `)
          .eq('id', applicationId)
          .single();

        if (error) {
          console.error('Error fetching application:', error);
          setError(error.message);
          return;
        }

        // Safely handle potentially missing developer_profiles data
        const dp = data.developer_profiles;
        const safeDeveloperProfiles: DeveloperProfile = {
          id: data.developer_id,
          skills: Array.isArray(dp?.skills) ? dp.skills : [],
          experience: typeof dp?.experience === 'string' ? dp.experience : '',
          hourly_rate: typeof dp?.hourly_rate === 'number' ? dp.hourly_rate : 0
        };

        // Cast to the expected type with safe values
        const safeApplication = {
          ...data,
          developer_profiles: safeDeveloperProfiles,
        } as unknown as HelpRequestMatch;

        setApplication(safeApplication);
      } catch (err) {
        console.error('Failed to fetch application:', err);
        setError('Failed to load application details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplication();
  }, [applicationId]);

  const handleApprove = async () => {
    if (!application) return;
    
    setIsProcessing(true);
    try {
      // Update application status
      const { error: applicationError } = await supabase
        .from('help_request_matches')
        .update({ status: 'approved' })
        .eq('id', applicationId);

      if (applicationError) {
        toast.error('Failed to approve application');
        console.error('Error approving application:', applicationError);
        return;
      }

      // Update help request status
      const { error: requestError } = await supabase
        .from('help_requests')
        .update({ 
          status: 'in_progress',
          selected_developer_id: application.developer_id
        })
        .eq('id', application.request_id);

      if (requestError) {
        toast.error('Failed to update help request status');
        console.error('Error updating help request:', requestError);
        return;
      }

      toast.success('Application approved successfully!');
      navigate(`/client/tickets/${application.request_id}`);
    } catch (err) {
      console.error('Error in approval process:', err);
      toast.error('An error occurred during approval');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!application) return;
    
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('help_request_matches')
        .update({ status: 'rejected' })
        .eq('id', applicationId);

      if (error) {
        toast.error('Failed to reject application');
        console.error('Error rejecting application:', error);
        return;
      }

      toast.success('Application rejected successfully');
      navigate(`/client/tickets/${application.request_id}`);
    } catch (err) {
      console.error('Error rejecting application:', err);
      toast.error('An error occurred while rejecting the application');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container max-w-4xl mx-auto py-8 px-4">
          <h1 className="text-2xl font-bold mb-6">Loading application details...</h1>
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded mb-4"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container max-w-4xl mx-auto py-8 px-4">
          <h1 className="text-2xl font-bold mb-4">Error Loading Application</h1>
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => navigate(-1)}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </Layout>
    );
  }

  if (!application) {
    return (
      <Layout>
        <div className="container max-w-4xl mx-auto py-8 px-4">
          <h1 className="text-2xl font-bold mb-4">Application Not Found</h1>
          <Button onClick={() => navigate(-1)}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </Layout>
    );
  }

  const developerName = application.profiles?.name || "Anonymous Developer";
  const developerImage = application.profiles?.image || "";
  const developerSkills = application.developer_profiles?.skills || [];
  const developerExperience = application.developer_profiles?.experience || "No experience provided";
  const developerRate = application.proposed_rate || application.developer_profiles?.hourly_rate || 0;
  const proposedDuration = application.proposed_duration || 0;

  return (
    <Layout>
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Button onClick={() => navigate(-1)} variant="ghost" className="mb-4">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={developerImage} alt={developerName} />
                <AvatarFallback>{developerName.charAt(0)}</AvatarFallback>
              </Avatar>
              <CardTitle>{developerName}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">Status: {application.status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {developerExperience}
              </p>
              <p className="text-sm">
                Skills: {developerSkills.join(', ')}
              </p>
              <p className="text-sm">
                Proposed Rate: ${developerRate}/hr
              </p>
              {proposedDuration > 0 && (
                <p className="text-sm">
                  Proposed Duration: {proposedDuration} hours
                </p>
              )}
              {application.proposed_message && (
                <div className="mt-2">
                  <p className="text-sm font-medium">Message:</p>
                  <p className="text-sm">{application.proposed_message}</p>
                </div>
              )}
              {application.help_requests && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-2">Help Request Details</h3>
                  <p className="text-sm">Title: {application.help_requests.title}</p>
                  <p className="text-sm">Description: {application.help_requests.description}</p>
                </div>
              )}
              <div className="flex justify-end space-x-2 mt-4">
                <Button
                  variant="outline"
                  className="bg-red-500 text-white hover:bg-red-700"
                  onClick={handleReject}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      Rejecting...
                    </>
                  ) : (
                    <>
                      <X className="mr-2 h-4 w-4" />
                      Reject
                    </>
                  )}
                </Button>
                <Button
                  className="bg-green-500 text-white hover:bg-green-700"
                  onClick={handleApprove}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      Approving...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Approve
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ApplicationDetailPage;
