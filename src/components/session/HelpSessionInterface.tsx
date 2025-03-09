import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { getHelpRequestById } from '@/integrations/supabase/helpRequests';
import { HelpRequest, HelpRequestStatus, HelpSession } from '@/types/helpRequest';
import { startSession, endSession, updateSharedCode } from '@/integrations/supabase/sessionManager';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import { Clock, Play, Stop, Save, Code, MessageSquare, Users } from 'lucide-react';
import ChatInterface from './ChatInterface';
import CodeEditor from './CodeEditor';
import useSessionInterface from '@/hooks/useSessionInterface';

const HelpSessionInterface: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { userId } = useAuth();
  const [helpRequest, setHelpRequest] = useState<HelpRequest | null>(null);
  const [session, setSession] = useState<HelpSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [sharedCode, setSharedCode] = useState<string>('');

  useEffect(() => {
    const fetchHelpRequest = async () => {
      setIsLoading(true);
      try {
        const request = await getHelpRequestById(sessionId);
        setHelpRequest(request);
      } catch (error) {
        console.error('Error fetching help request:', error);
        toast.error('Failed to load help request');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHelpRequest();
  }, [sessionId]);

  const handleStartSession = async () => {
    if (!helpRequest) return;
    setIsStarting(true);
    try {
      const newSession = await startSession(helpRequest.id);
      setSession(newSession);
      toast.success('Session started successfully');
    } catch (error) {
      console.error('Error starting session:', error);
      toast.error('Failed to start session');
    } finally {
      setIsStarting(false);
    }
  };

  const handleEndSession = async () => {
    if (!session) return;
    setIsEnding(true);
    try {
      await endSession(session.id);
      toast.success('Session ended successfully');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error ending session:', error);
      toast.error('Failed to end session');
    } finally {
      setIsEnding(false);
    }
  };

  const handleUpdateSharedCode = async () => {
    if (!session) return;
    try {
      await updateSharedCode(session.id, sharedCode);
      toast.success('Shared code updated successfully');
    } catch (error) {
      console.error('Error updating shared code:', error);
      toast.error('Failed to update shared code');
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>{helpRequest?.title}</CardTitle>
          <CardDescription>{helpRequest?.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Badge>{helpRequest?.status}</Badge>
          <Separator />
          <div>
            <Button onClick={handleStartSession} disabled={isStarting}>
              {isStarting ? 'Starting...' : 'Start Session'}
            </Button>
            <Button onClick={handleEndSession} disabled={isEnding}>
              {isEnding ? 'Ending...' : 'End Session'}
            </Button>
          </div>
          <div>
            <textarea
              value={sharedCode}
              onChange={(e) => setSharedCode(e.target.value)}
              placeholder="Share your code here..."
            />
            <Button onClick={handleUpdateSharedCode}>Update Shared Code</Button>
          </div>
        </CardContent>
      </Card>
      <Tabs>
        <TabsList>
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="code">Code Editor</TabsTrigger>
        </TabsList>
        <TabsContent value="chat">
          <ChatInterface sessionId={sessionId} />
        </TabsContent>
        <TabsContent value="code">
          <CodeEditor />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HelpSessionInterface;
