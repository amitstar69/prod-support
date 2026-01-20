
import React, { useState, useEffect } from 'react';
import { supabase } from '../../integrations/supabase/client';
import { HelpRequestMatch, DeveloperProfile } from '../../types/helpRequest';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { isDeveloperProfile } from '../../utils/typeGuards';

interface DeveloperApplicationsPanelProps {
  ticketId: string;
  onApplicationAccepted: () => void;
}

const DeveloperApplicationsPanel: React.FC<DeveloperApplicationsPanelProps> = ({
  ticketId,
  onApplicationAccepted
}) => {
  const [applications, setApplications] = useState<HelpRequestMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplications = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('help_request_matches')
          .select(`                                                                                                                                                                          
    *,                                                                                                                                                                               
    profiles!developer_id (                                                                                                                                                          
      id,                                                                                                                                                                            
      name,                                                                                                                                                                          
      email,                                                                                                                                                                         
      image,                                                                                                                                                                         
      location                                                                                                                                                                       
    )                                                                                                                                                                                
  `)   
          .eq('request_id', ticketId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching applications:', error);
          setError(error.message);
        } else {
          // Safely process the data with proper type handling
          const processedData = (data || []).map(app => {
            // Safely handle profiles data
            const safeProfiles = app.profiles && typeof app.profiles === 'object' 
              ? app.profiles 
              : { 
                  id: app.developer_id, 
                  name: 'Unknown Developer',
                  image: null,
                  description: '',
                  location: ''
                };
            
            // Safely handle developer_profiles data
            let safeDeveloperProfiles: DeveloperProfile = {
              id: app.developer_id || '',
              skills: [],
              experience: 'No experience information available',
              hourly_rate: 0
            };
            
            // Check if developer_profiles is a valid object and not an error
            if (isDeveloperProfile(app.developer_profiles)) {
              safeDeveloperProfiles = {
                id: app.developer_id || '',
                skills: Array.isArray(app.developer_profiles.skills) ? app.developer_profiles.skills : [],
                experience: typeof app.developer_profiles.experience === 'string' ? app.developer_profiles.experience : 'No experience information',
                hourly_rate: typeof app.developer_profiles.hourly_rate === 'number' ? app.developer_profiles.hourly_rate : 0
              };
            }
            
            return {
              ...app,
              profiles: safeProfiles,
              developer_profiles: safeDeveloperProfiles
            } as HelpRequestMatch;
          });
          
          setApplications(processedData);
        }
      } catch (err) {
        console.error('Failed to fetch applications:', err);
        setError('Failed to load applications');
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, [ticketId]);

  const handleAcceptApplication = async (applicationId: string) => {
    try {
      const { error } = await supabase
        .from('help_request_matches')
        .update({ status: 'approved' })
        .eq('id', applicationId);

      if (error) {
        console.error('Error accepting application:', error);
        toast.error('Failed to accept application');
        return;
      }

      // Update the help_request status to 'in_progress'
      const { error: updateTicketError } = await supabase
        .from('help_requests')
        .update({ status: 'in_progress' })
        .eq('id', ticketId);

      if (updateTicketError) {
        console.error('Error updating ticket status:', updateTicketError);
        toast.error('Failed to update ticket status');
        return;
      }

      toast.success('Application accepted successfully!');
      onApplicationAccepted();
    } catch (err) {
      console.error('Failed to accept application:', err);
      toast.error('Failed to accept application');
    }
  };

  const handleRejectApplication = async (applicationId: string) => {
    try {
      const { error } = await supabase
        .from('help_request_matches')
        .update({ status: 'rejected' })
        .eq('id', applicationId);

      if (error) {
        console.error('Error rejecting application:', error);
        toast.error('Failed to reject application');
        return;
      }

      toast.success('Application rejected successfully!');
      // Refresh applications list
      setApplications(prevApplications =>
        prevApplications.filter(app => app.id !== applicationId)
      );
    } catch (err) {
      console.error('Failed to reject application:', err);
      toast.error('Failed to reject application');
    }
  };

  const renderApplication = (app: HelpRequestMatch) => {
    const developerName = app.profiles?.name || "Anonymous Developer";
    const developerImage = app.profiles?.image || "";
    
    // Safely access developer_profiles properties with null checks
    const developerSkills = app.developer_profiles && 'skills' in app.developer_profiles && Array.isArray(app.developer_profiles.skills) 
      ? app.developer_profiles.skills 
      : [];
      
    const developerExperience = app.developer_profiles && 'experience' in app.developer_profiles && typeof app.developer_profiles.experience === 'string'
      ? app.developer_profiles.experience 
      : "No experience provided";
      
    const developerRate = app.proposed_rate || (app.developer_profiles && 'hourly_rate' in app.developer_profiles ? app.developer_profiles.hourly_rate : 0);
    const proposedDuration = app.proposed_duration || 0;

    return (
      <Card key={app.id} className="mb-4">
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
          {app.proposed_message && (
            <p className="mt-2 text-sm">
              Message: {app.proposed_message}
            </p>
          )}
          <div className="flex justify-end mt-4">
            <Button
              variant="outline"
              size="sm"
              className="mr-2"
              onClick={() => handleRejectApplication(app.id!)}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Reject
            </Button>
            <Button
              size="sm"
              onClick={() => handleAcceptApplication(app.id!)}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Accept
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return <Card className="p-6">Loading applications...</Card>;
  }

  if (error) {
    return <Card className="p-6 text-red-500">Error: {error}</Card>;
  }

  if (!applications.length) {
    return <Card className="p-6">No applications found.</Card>;
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Developer Applications</h2>
      {applications.map(renderApplication)}
    </div>
  );
};

export default DeveloperApplicationsPanel;
