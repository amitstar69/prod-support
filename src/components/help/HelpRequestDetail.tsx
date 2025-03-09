import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/auth';
import { 
  getHelpRequestById, 
  cancelHelpRequest 
} from '../../integrations/supabase/helpRequests';
import { 
  HelpRequest, 
  HelpRequestStatus 
} from '../../types/helpRequest';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../ui/card';
import { Separator } from '../ui/separator';
import { toast } from 'sonner';
import { Clock, AlertTriangle, Check, ArrowLeft, Loader2 } from 'lucide-react';

const HelpRequestDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userId } = useAuth();
  const [helpRequest, setHelpRequest] = useState<HelpRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    const fetchHelpRequest = async () => {
      try {
        const request = await getHelpRequestById(id!);
        setHelpRequest(request);
      } catch (error) {
        console.error('Error fetching help request:', error);
        toast.error('Failed to load help request details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHelpRequest();
  }, [id]);

  const handleCancelRequest = async () => {
    if (!helpRequest) return;

    setIsCancelling(true);
    try {
      await cancelHelpRequest(helpRequest.id);
      toast.success('Help request cancelled successfully.');
      navigate('/client/dashboard'); // Redirect after cancellation
    } catch (error) {
      console.error('Error cancelling help request:', error);
      toast.error('Failed to cancel help request.');
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!helpRequest) {
    return (
      <div className="text-center">
        <h2 className="heading-3 mb-4">Help Request Not Found</h2>
        <p className="text-muted-foreground">The requested help request could not be found.</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{helpRequest.title}</CardTitle>
        <CardDescription>{helpRequest.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-2">
          <div>
            <Badge>{helpRequest.status as HelpRequestStatus}</Badge>
          </div>
          <div>
            <strong>Technical Area:</strong> {helpRequest.technical_area.join(', ')}
          </div>
          <div>
            <strong>Urgency:</strong> {helpRequest.urgency}
          </div>
          <div>
            <strong>Estimated Duration:</strong> {helpRequest.estimated_duration} minutes
          </div>
          <div>
            <strong>Budget Range:</strong> {helpRequest.budget_range}
          </div>
          <div>
            <strong>Communication Preference:</strong> {helpRequest.communication_preference.join(', ')}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        {helpRequest.client_id === userId && helpRequest.status === 'pending' && (
          <Button 
            variant="destructive" 
            onClick={handleCancelRequest} 
            disabled={isCancelling}
          >
            {isCancelling ? 'Cancelling...' : 'Cancel Help Request'}
          </Button>
        )}
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2" />
          Back
        </Button>
      </CardFooter>
    </Card>
  );
};

export default HelpRequestDetail;
