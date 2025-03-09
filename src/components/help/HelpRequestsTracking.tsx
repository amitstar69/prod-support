
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/auth';
import { 
  HelpRequest, 
  HelpRequestStatus
} from '../../types/helpRequest';
import { 
  getClientHelpRequests, 
  cancelHelpRequest 
} from '../../integrations/supabase/helpRequests';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import { AlertTriangle, Clock, Check, X, Loader2 } from 'lucide-react';

const HelpRequestsTracking: React.FC = () => {
  const { userId } = useAuth();
  const [helpRequests, setHelpRequests] = useState<HelpRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHelpRequests = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!userId) {
          setHelpRequests([]);
          setLoading(false);
          return;
        }
        const response = await getClientHelpRequests(userId);
        if (response.success && response.data) {
          setHelpRequests(response.data);
        } else {
          setError('Failed to load help requests: ' + (response.error || 'Unknown error'));
        }
      } catch (err) {
        console.error('Error fetching help requests:', err);
        setError('Failed to load help requests.');
      } finally {
        setLoading(false);
      }
    };

    fetchHelpRequests();
  }, [userId]);

  const handleCancelRequest = async (requestId: string) => {
    try {
      const result = await cancelHelpRequest(requestId);
      if (result.success) {
        setHelpRequests(prev => prev.filter(req => req.id !== requestId));
        toast.success('Help request cancelled successfully');
      } else {
        toast.error('Failed to cancel help request: ' + result.error);
      }
    } catch (err) {
      console.error('Error cancelling help request:', err);
      toast.error('Failed to cancel help request');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <Tabs defaultValue="active" className="w-full">
      <TabsList>
        <TabsTrigger value="active">Active Requests</TabsTrigger>
        <TabsTrigger value="completed">Completed Requests</TabsTrigger>
      </TabsList>
      <TabsContent value="active">
        <ScrollArea className="h-96">
          {helpRequests.filter(req => req.status === 'pending' || req.status === 'matching').map(request => (
            <Card key={request.id} className="mb-4">
              <CardHeader>
                <CardTitle>{request.title}</CardTitle>
                <CardDescription>{request.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="outline">{request.status}</Badge>
                <Button onClick={() => handleCancelRequest(request.id)} variant="destructive" className="mt-2">
                  Cancel Request
                </Button>
              </CardContent>
            </Card>
          ))}
        </ScrollArea>
      </TabsContent>
      <TabsContent value="completed">
        <ScrollArea className="h-96">
          {helpRequests.filter(req => req.status === 'completed').map(request => (
            <Card key={request.id} className="mb-4">
              <CardHeader>
                <CardTitle>{request.title}</CardTitle>
                <CardDescription>{request.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="outline">{request.status}</Badge>
              </CardContent>
            </Card>
          ))}
        </ScrollArea>
      </TabsContent>
    </Tabs>
  );
};

export default HelpRequestsTracking;
